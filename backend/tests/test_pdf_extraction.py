from pathlib import Path

from campusinsight_api.services.pdf_extraction import (
    extract_pdf_text_from_bytes,
    extract_pdf_text_from_file,
)


def test_extract_pdf_text_from_bytes_returns_structured_text() -> None:
    result = extract_pdf_text_from_bytes(_minimal_pdf("TRANSKRIP SEMENTARA\nNIM: TST001"))

    assert result.is_valid is True
    assert result.page_count == 1
    assert result.errors == []
    assert result.pages[0].page_number == 1
    assert "TRANSKRIP SEMENTARA" in result.text
    assert "NIM: TST001" in result.text


def test_extract_pdf_text_from_file_returns_structured_text(tmp_path: Path) -> None:
    pdf_path = tmp_path / "transcript.pdf"
    pdf_path.write_bytes(_minimal_pdf("CampusInsight transcript fixture"))

    result = extract_pdf_text_from_file(pdf_path)

    assert result.is_valid is True
    assert result.page_count == 1
    assert "CampusInsight transcript fixture" in result.text


def test_extract_pdf_text_rejects_empty_pdf_content() -> None:
    result = extract_pdf_text_from_bytes(b"")

    assert result.is_valid is False
    assert result.page_count == 0
    assert result.errors[0].page_number is None
    assert "empty" in result.errors[0].message.lower()


def test_extract_pdf_text_handles_corrupted_pdf_safely() -> None:
    result = extract_pdf_text_from_bytes(b"not a pdf file")

    assert result.is_valid is False
    assert result.pages == []
    assert result.errors[0].message == "PDF file could not be parsed."


def test_extract_pdf_text_missing_file_returns_safe_error(tmp_path: Path) -> None:
    result = extract_pdf_text_from_file(tmp_path / "missing.pdf")

    assert result.is_valid is False
    assert result.errors[0].message == "PDF file could not be read."


def test_extract_pdf_text_does_not_expose_stack_traces() -> None:
    result = extract_pdf_text_from_bytes(b"not a pdf file")
    response_text = str(result)

    assert "Traceback" not in response_text
    assert "PdfReadError" not in response_text
    assert "FileNotFoundError" not in response_text


def _minimal_pdf(text: str) -> bytes:
    escaped_text = (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("\n", ") Tj T* (")
    )
    stream = f"BT /F1 12 Tf 72 720 Td ({escaped_text}) Tj ET".encode()
    objects = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        b"<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 4 0 R >> >> "
        b"/MediaBox [0 0 612 792] /Contents 5 0 R >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
        b"<< /Length %d >>\nstream\n" % len(stream) + stream + b"\nendstream",
    ]

    pdf = bytearray(b"%PDF-1.4\n")
    offsets = [0]
    for index, pdf_object in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf += f"{index} 0 obj\n".encode() + pdf_object + b"\nendobj\n"

    xref_offset = len(pdf)
    pdf += f"xref\n0 {len(objects) + 1}\n0000000000 65535 f \n".encode()
    for offset in offsets[1:]:
        pdf += f"{offset:010d} 00000 n \n".encode()

    pdf += (
        f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n"
    ).encode()
    return bytes(pdf)
