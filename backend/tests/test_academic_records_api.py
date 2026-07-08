from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from campusinsight_api.api.academic_records import get_saved_analysis_repository
from campusinsight_api.main import app
from campusinsight_api.services.saved_analysis_repository import SavedAnalysisRepository

client = TestClient(app)

ROOT_DIR = Path(__file__).resolve().parents[2]
SAMPLE_CSV = ROOT_DIR / "data" / "sample" / "academic_records_sample.csv"
FIXTURES_DIR = Path(__file__).parent / "fixtures"


@pytest.fixture()
def saved_analysis_repository(tmp_path: Path):
    repository = SavedAnalysisRepository(tmp_path / "campusinsight.sqlite3")
    app.dependency_overrides[get_saved_analysis_repository] = lambda: repository
    yield repository
    app.dependency_overrides.clear()


def test_valid_csv_upload_returns_valid_result() -> None:
    response = _upload_file(SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is True
    assert payload["errors"] == []
    assert payload["row_count"] == 16
    assert payload["records"][0]["student_id"] == "S1001"


def test_invalid_csv_upload_returns_invalid_result() -> None:
    response = _upload_file(FIXTURES_DIR / "invalid_bad_values.csv")

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is False
    assert payload["records"] == []
    assert payload["row_count"] == 3


def test_missing_file_returns_400() -> None:
    response = client.post("/academic-records/validate")

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert payload["errors"][0]["field"] == "file"


def test_empty_file_returns_400() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("empty.csv", b"", "text/csv")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "empty" in payload["errors"][0]["message"].lower()


def test_non_csv_filename_returns_400() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.txt", b"student_id\nS1001\n", "text/csv")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert ".csv" in payload["errors"][0]["message"]


def test_invalid_content_type_returns_400() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.csv", b"student_id\nS1001\n", "application/json")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "CSV file" in payload["errors"][0]["message"]


def test_unreadable_content_returns_safe_error() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.csv", b"\xff\xfe\xfa", "text/csv")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "readable UTF-8 text" in payload["errors"][0]["message"]


def test_validation_errors_include_row_number_field_and_message() -> None:
    response = _upload_file(FIXTURES_DIR / "invalid_bad_values.csv")

    error = response.json()["errors"][0]
    assert {"row_number", "field", "message"}.issubset(error)
    assert isinstance(error["row_number"], int)
    assert isinstance(error["field"], str)
    assert isinstance(error["message"], str)


def test_upload_response_does_not_expose_stack_traces() -> None:
    response = client.post(
        "/academic-records/validate",
        files={"file": ("records.csv", b"\xff\xfe\xfa", "text/csv")},
    )

    response_body = response.text
    assert "Traceback" not in response_body
    assert "UnicodeDecodeError" not in response_body
    assert "FileNotFoundError" not in response_body
    assert str(ROOT_DIR) not in response_body


def test_analyze_valid_csv_returns_analytics_result(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = _post_file("/academic-records/analyze", SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["analysis_id"]
    assert payload["is_valid"] is True
    assert payload["validation"]["row_count"] == 16
    assert payload["validation"]["errors"] == []
    assert payload["analytics"]["gpa_summary"]["weighted_gpa"] == 3.11
    assert payload["analytics"]["gpa_summary"]["total_courses"] == 16
    assert len(payload["analytics"]["semester_performance"]) == 2
    assert len(payload["analytics"]["course_performance"]) == 16
    assert payload["analytics"]["credit_summary"]["total_credits"] == 46.0
    assert payload["analytics"]["course_risks"]
    assert saved_analysis_repository.get(payload["analysis_id"]) is not None


def test_analyze_invalid_csv_returns_validation_errors_without_analytics(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = _post_file("/academic-records/analyze", FIXTURES_DIR / "invalid_bad_values.csv")

    payload = response.json()
    assert response.status_code == 200
    assert "analysis_id" not in payload
    assert payload["is_valid"] is False
    assert payload["validation"]["row_count"] == 3
    assert payload["validation"]["errors"][0]["row_number"] == 2
    assert payload["validation"]["errors"][0]["field"] == "semester"
    assert payload["analytics"] is None
    assert saved_analysis_repository.list() == []


def test_analyze_valid_csv_saves_canonical_response_json(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = _post_file("/academic-records/analyze", SAMPLE_CSV)

    payload = response.json()
    saved_analysis = saved_analysis_repository.get(payload["analysis_id"])

    assert saved_analysis is not None
    assert saved_analysis.analysis == payload
    assert saved_analysis.summary.source_filename == "academic_records_sample.csv"
    assert saved_analysis.summary.row_count == 16
    assert saved_analysis.summary.total_courses == 16
    assert saved_analysis.summary.weighted_gpa == 3.11
    assert saved_analysis.summary.average_score == 80.0


def test_analyze_valid_csv_does_not_store_uploaded_csv_file(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = _post_file("/academic-records/analyze", SAMPLE_CSV)

    saved_analysis = saved_analysis_repository.get(response.json()["analysis_id"])

    assert saved_analysis is not None
    assert "student_id,student_name" not in str(saved_analysis.analysis)


def test_analyze_upload_error_response_does_not_expose_stack_traces() -> None:
    response = client.post(
        "/academic-records/analyze",
        files={"file": ("records.csv", b"\xff\xfe\xfa", "text/csv")},
    )

    payload = response.json()
    response_body = response.text
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert payload["analytics"] is None
    assert "Traceback" not in response_body
    assert "UnicodeDecodeError" not in response_body
    assert str(ROOT_DIR) not in response_body


def test_analyze_valid_pdf_returns_analytics_result(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = client.post(
        "/academic-records/analyze-pdf",
        files={
            "file": (
                "transcript.pdf",
                _minimal_pdf(_sample_transcript_text()),
                "application/pdf",
            )
        },
    )

    payload = response.json()
    assert response.status_code == 200
    assert payload["analysis_id"]
    assert payload["is_valid"] is True
    assert payload["validation"]["row_count"] == 3
    assert payload["validation"]["errors"] == []
    assert payload["analytics"]["gpa_summary"]["total_courses"] == 3
    assert payload["analytics"]["gpa_summary"]["weighted_gpa"] == 3.83
    assert saved_analysis_repository.get(payload["analysis_id"]) is not None


def test_analyze_pdf_invalid_transcript_returns_validation_errors_without_analytics(
    saved_analysis_repository: SavedAnalysisRepository,
) -> None:
    response = client.post(
        "/academic-records/analyze-pdf",
        files={"file": ("transcript.pdf", _minimal_pdf("TRANSKRIP SEMENTARA"), "application/pdf")},
    )

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is False
    assert payload["analytics"] is None
    assert payload["validation"]["errors"]
    assert saved_analysis_repository.list() == []


def test_analyze_pdf_missing_file_returns_400() -> None:
    response = client.post("/academic-records/analyze-pdf")

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert payload["validation"]["errors"][0]["field"] == "file"


def test_analyze_pdf_non_pdf_filename_returns_400() -> None:
    response = client.post(
        "/academic-records/analyze-pdf",
        files={"file": ("transcript.txt", b"not pdf", "application/pdf")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert ".pdf" in payload["validation"]["errors"][0]["message"]


def test_analyze_pdf_invalid_content_type_returns_400() -> None:
    response = client.post(
        "/academic-records/analyze-pdf",
        files={"file": ("transcript.pdf", b"not pdf", "text/plain")},
    )

    payload = response.json()
    assert response.status_code == 400
    assert payload["is_valid"] is False
    assert "PDF file" in payload["validation"]["errors"][0]["message"]


def test_analyze_pdf_corrupted_file_returns_safe_error() -> None:
    response = client.post(
        "/academic-records/analyze-pdf",
        files={"file": ("transcript.pdf", b"not pdf", "application/pdf")},
    )

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is False
    assert payload["analytics"] is None
    assert payload["validation"]["errors"][0]["message"] == "PDF file could not be parsed."


def test_analyze_pdf_response_does_not_expose_stack_traces() -> None:
    response = client.post(
        "/academic-records/analyze-pdf",
        files={"file": ("transcript.pdf", b"not pdf", "application/pdf")},
    )

    response_body = response.text
    assert "Traceback" not in response_body
    assert "PdfReadError" not in response_body
    assert "FileNotFoundError" not in response_body
    assert str(ROOT_DIR) not in response_body


def test_validation_endpoint_still_returns_validation_result() -> None:
    response = _upload_file(SAMPLE_CSV)

    payload = response.json()
    assert response.status_code == 200
    assert payload["is_valid"] is True
    assert payload["row_count"] == 16
    assert "analytics" not in payload


def _upload_file(path: Path):
    return _post_file("/academic-records/validate", path)


def _post_file(url: str, path: Path):
    return client.post(
        url,
        files={"file": (path.name, path.read_bytes(), "text/csv")},
    )


def _sample_transcript_text() -> str:
    return """
TRANSKRIP SEMENTARA
NIM: TST23010001 FAKULTAS : Ilmu Komputer
NAMA: ALEX PRATAMA (Lapor BAP, Ijazah) PROGRAM STUDI: Teknik Informatika
NOSMTKODE MATA KULIAH SKSNHNB(SKSxNB)
1 I F062100001DASAR KEAMANAN KOMPUTER  3 A 4.00 12.00
2 II W152100004MATEMATIKA DISKRIT  3 B+3.50 10.50
3 II W152100011SISTEM OPERASI  3 A 4.00 12.00
"""


def _minimal_pdf(text: str) -> bytes:
    escaped_text = (
        text.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)").replace("\n", "\\n")
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
