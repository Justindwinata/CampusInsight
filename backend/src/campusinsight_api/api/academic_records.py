from typing import Annotated

from fastapi import APIRouter, File, UploadFile
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse

from campusinsight_api.services.analytics_service import calculate_academic_analytics
from campusinsight_api.services.csv_validation import (
    CsvValidationResult,
    ValidationError,
    validate_academic_records_csv_content,
)

router = APIRouter(prefix="/academic-records", tags=["academic-records"])

SUPPORTED_CSV_CONTENT_TYPES = {
    "text/csv",
    "application/csv",
    "application/vnd.ms-excel",
}


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
    return JSONResponse(
        content=jsonable_encoder(
            {
                "is_valid": True,
                "validation": {
                    "row_count": validation_result.row_count,
                    "errors": validation_result.errors,
                },
                "analytics": analytics,
            }
        )
    )


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
