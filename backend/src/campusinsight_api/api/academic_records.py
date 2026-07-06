from typing import Annotated

from fastapi import APIRouter, File, UploadFile
from fastapi.encoders import jsonable_encoder
from starlette.responses import JSONResponse

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
    if file is None:
        return _bad_request("CSV file is required.")

    filename = file.filename or ""
    if not filename.lower().endswith(".csv"):
        return _bad_request("Uploaded file must use a .csv extension.")

    if file.content_type and file.content_type not in SUPPORTED_CSV_CONTENT_TYPES:
        return _bad_request("Uploaded file must be a CSV file.")

    file_bytes = await file.read()
    if not file_bytes:
        return _bad_request("Uploaded CSV file must not be empty.")

    try:
        csv_content = file_bytes.decode("utf-8-sig")
    except UnicodeDecodeError:
        return _bad_request("Uploaded CSV file must be readable UTF-8 text.")

    return validate_academic_records_csv_content(csv_content)


def _bad_request(message: str) -> JSONResponse:
    result = CsvValidationResult(
        is_valid=False,
        records=[],
        errors=[ValidationError(row_number=None, field="file", message=message)],
        row_count=0,
    )
    return JSONResponse(status_code=400, content=jsonable_encoder(result))
