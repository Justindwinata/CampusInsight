from __future__ import annotations

from dataclasses import dataclass
from io import BytesIO
from pathlib import Path

from pypdf import PdfReader
from pypdf.errors import PdfReadError


@dataclass(frozen=True, slots=True)
class PdfExtractionError:
    page_number: int | None
    message: str


@dataclass(frozen=True, slots=True)
class PdfPageText:
    page_number: int
    text: str


@dataclass(frozen=True, slots=True)
class PdfExtractionResult:
    is_valid: bool
    text: str
    pages: list[PdfPageText]
    errors: list[PdfExtractionError]
    page_count: int


def extract_pdf_text_from_file(file_path: str | Path) -> PdfExtractionResult:
    try:
        file_bytes = Path(file_path).read_bytes()
    except OSError:
        return _file_error("PDF file could not be read.")

    return extract_pdf_text_from_bytes(file_bytes)


def extract_pdf_text_from_bytes(file_bytes: bytes) -> PdfExtractionResult:
    if not file_bytes:
        return _file_error("PDF file must not be empty.")

    try:
        reader = PdfReader(BytesIO(file_bytes))
    except (PdfReadError, ValueError, OSError):
        return _file_error("PDF file could not be parsed.")

    if reader.is_encrypted:
        return _file_error("Encrypted PDF files are not supported.")

    pages: list[PdfPageText] = []
    errors: list[PdfExtractionError] = []

    for page_index, page in enumerate(reader.pages, start=1):
        try:
            page_text = (page.extract_text() or "").strip()
        except (PdfReadError, ValueError, OSError):
            errors.append(
                PdfExtractionError(
                    page_number=page_index,
                    message="PDF page text could not be extracted.",
                )
            )
            continue

        pages.append(PdfPageText(page_number=page_index, text=page_text))

    combined_text = "\n\n".join(page.text for page in pages if page.text).strip()
    if not combined_text:
        errors.append(
            PdfExtractionError(
                page_number=None,
                message="PDF did not contain readable text. OCR is not supported yet.",
            )
        )

    return PdfExtractionResult(
        is_valid=not errors,
        text=combined_text,
        pages=pages,
        errors=errors,
        page_count=len(reader.pages),
    )


def _file_error(message: str) -> PdfExtractionResult:
    return PdfExtractionResult(
        is_valid=False,
        text="",
        pages=[],
        errors=[PdfExtractionError(page_number=None, message=message)],
        page_count=0,
    )
