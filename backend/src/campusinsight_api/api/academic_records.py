from typing import Annotated
from uuid import uuid4

from fastapi import APIRouter, Depends, File, UploadFile
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse

from campusinsight_api.services.analytics_service import calculate_academic_analytics
from campusinsight_api.services.csv_validation import (
    CsvValidationResult,
    ValidationError,
    validate_academic_records_csv_content,
)
from campusinsight_api.services.pdf_extraction import extract_pdf_text_from_bytes
from campusinsight_api.services.saved_analysis_repository import SavedAnalysisRepository
from campusinsight_api.services.transcript_course_parser import parse_transcript_course_records
from campusinsight_api.services.transcript_metadata_parser import parse_transcript_metadata
from campusinsight_api.services.transcript_normalization import normalize_transcript_records

router = APIRouter(prefix="/academic-records", tags=["academic-records"])

SUPPORTED_CSV_CONTENT_TYPES = {
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
}
SUPPORTED_PDF_CONTENT_TYPES = {
    "application/pdf",
    "application/x-pdf",
}


def get_saved_analysis_repository() -> SavedAnalysisRepository:
    return SavedAnalysisRepository()


@router.post("/validate", response_model=None)
async def validate_academic_records_upload(
    file: Annotated[UploadFile | None, File()] = None,
) -> CsvValidationResult | JSONResponse:
    csv_content, error_message = await _read_csv_upload_content(file)
    if error_message:
        return _bad_request(error_message)

    return validate_academic_records_csv_content(csv_content or "")


@router.post("/analyze", response_model=None)
async def analyze_academic_records_upload(
    repository: Annotated[SavedAnalysisRepository, Depends(get_saved_analysis_repository)],
    file: Annotated[UploadFile | None, File()] = None,
) -> JSONResponse:
    csv_content, error_message = await _read_csv_upload_content(file)
    if error_message:
        return _analysis_bad_request(error_message)

    validation_result = validate_academic_records_csv_content(csv_content or "")
    if not validation_result.is_valid:
        return JSONResponse(
            content=jsonable_encoder(
                {
                    "is_valid": False,
                    "validation": {
                        "row_count": validation_result.row_count,
                        "errors": validation_result.errors,
                    },
                    "analytics": None,
                }
            )
        )

    analytics = calculate_academic_analytics(validation_result.records)
    analysis_id = str(uuid4())
    response_content = jsonable_encoder(
        {
            "analysis_id": analysis_id,
            "is_valid": True,
            "validation": {
                "row_count": validation_result.row_count,
                "errors": validation_result.errors,
            },
            "analytics": analytics,
        }
    )
    gpa_summary = response_content["analytics"]["gpa_summary"]
    repository.save(
        analysis_id=analysis_id,
        source_filename=file.filename if file else "uploaded.csv",
        row_count=validation_result.row_count,
        total_courses=gpa_summary["total_courses"],
        weighted_gpa=gpa_summary["weighted_gpa"],
        average_score=gpa_summary["average_score"],
        analysis=response_content,
    )

    return JSONResponse(content=response_content)


@router.post("/analyze-pdf", response_model=None)
async def analyze_academic_records_pdf_upload(
    repository: Annotated[SavedAnalysisRepository, Depends(get_saved_analysis_repository)],
    file: Annotated[UploadFile | None, File()] = None,
) -> JSONResponse:
    pdf_content, error_message = await _read_pdf_upload_content(file)
    if error_message:
        return _analysis_bad_request(error_message)

    extraction_result = extract_pdf_text_from_bytes(pdf_content or b"")
    if not extraction_result.is_valid:
        return _pdf_analysis_invalid(
            row_count=0,
            errors=[
                ValidationError(row_number=None, field="file", message=error.message)
                for error in extraction_result.errors
            ],
        )

    metadata_result = parse_transcript_metadata(extraction_result.text)
    course_result = parse_transcript_course_records(extraction_result.text)
    if not metadata_result.is_valid or not course_result.is_valid:
        return _pdf_analysis_invalid(
            row_count=course_result.row_count,
            errors=[
                *[
                    ValidationError(row_number=None, field=error.field, message=error.message)
                    for error in metadata_result.errors
                ],
                *[
                    ValidationError(
                        row_number=error.row_number,
                        field=error.field,
                        message=error.message,
                    )
                    for error in course_result.errors
                ],
            ],
        )

    normalization_result = normalize_transcript_records(
        metadata=metadata_result.metadata,
        course_records=course_result.records,
    )
    if not normalization_result.is_valid:
        return _pdf_analysis_invalid(
            row_count=0,
            errors=[
                ValidationError(row_number=None, field=error.field, message=error.message)
                for error in normalization_result.errors
            ],
        )

    analytics = calculate_academic_analytics(normalization_result.records)
    analysis_id = str(uuid4())
    response_content = jsonable_encoder(
        {
            "analysis_id": analysis_id,
            "is_valid": True,
            "validation": {
                "row_count": normalization_result.row_count,
                "errors": [],
            },
            "analytics": analytics,
        }
    )
    gpa_summary = response_content["analytics"]["gpa_summary"]
    repository.save(
        analysis_id=analysis_id,
        source_filename=file.filename if file else "uploaded.pdf",
        row_count=normalization_result.row_count,
        total_courses=gpa_summary["total_courses"],
        weighted_gpa=gpa_summary["weighted_gpa"],
        average_score=gpa_summary["average_score"],
        analysis=response_content,
    )

    return JSONResponse(content=response_content)


async def _read_csv_upload_content(file: UploadFile | None) -> tuple[str | None, str | None]:
    if file is None:
        return None, "CSV file is required."

    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        return None, "Uploaded file must use a .csv extension."

    if file.content_type and file.content_type not in SUPPORTED_CSV_CONTENT_TYPES:
        return None, "Uploaded file must be a CSV file."

    file_bytes = await file.read()
    if not file_bytes:
        return None, "Uploaded CSV file must not be empty."

    try:
        csv_content = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        return None, "Uploaded CSV file must be readable UTF-8 text."

    return csv_content, None


async def _read_pdf_upload_content(file: UploadFile | None) -> tuple[bytes | None, str | None]:
    if file is None:
        return None, "PDF file is required."

    filename = file.filename or ""
    if not filename.lower().endswith(".pdf"):
        return None, "Uploaded file must use a .pdf extension."

    if file.content_type and file.content_type not in SUPPORTED_PDF_CONTENT_TYPES:
        return None, "Uploaded file must be a PDF file."

    file_bytes = await file.read()
    if not file_bytes:
        return None, "Uploaded PDF file must not be empty."

    return file_bytes, None


def _bad_request(message: str) -> JSONResponse:
    result = CsvValidationResult(
        is_valid=False,
        records=[],
        errors=[ValidationError(row_number=None, field="file", message=message)],
        row_count=0,
    )
    return JSONResponse(status_code=400, content=jsonable_encoder(result))


def _analysis_bad_request(message: str) -> JSONResponse:
    return JSONResponse(
        status_code=400,
        content=jsonable_encoder(
            {
                "is_valid": False,
                "validation": {
                    "row_count": 0,
                    "errors": [ValidationError(row_number=None, field="file", message=message)],
                },
                "analytics": None,
            }
        ),
    )


def _pdf_analysis_invalid(row_count: int, errors: list[ValidationError]) -> JSONResponse:
    return JSONResponse(
        content=jsonable_encoder(
            {
                "is_valid": False,
                "validation": {
                    "row_count": row_count,
                    "errors": errors,
                },
                "analytics": None,
            }
        )
    )
