from pathlib import Path

import pytest

from campusinsight_api.services.pdf_extraction import extract_pdf_text_from_file
from campusinsight_api.services.transcript_course_parser import parse_transcript_course_records

ROOT_DIR = Path(__file__).resolve().parents[2]
LOCAL_TRANSCRIPT_PDF = ROOT_DIR / "data" / "sample" / "Transkrip Mahasiswa.pdf"


def test_parse_transcript_course_records_from_text() -> None:
    result = parse_transcript_course_records(_sample_course_text())

    assert result.is_valid is True
    assert result.errors == []
    assert result.row_count == 4
    assert result.records[0].course_code == "F062100001"
    assert result.records[0].course_name == "DASAR KEAMANAN KOMPUTER"
    assert result.records[0].semester == 1
    assert result.records[0].credits == 3.0
    assert result.records[0].grade_letter == "A"
    assert result.records[0].grade_point == 4.0
    assert result.records[0].credit_weight == 12.0


def test_parse_transcript_course_records_handles_multiple_semesters() -> None:
    result = parse_transcript_course_records(_sample_course_text())

    assert [record.semester for record in result.records] == [1, 2, 2, 3]


def test_parse_transcript_course_records_handles_course_names_and_grade_variants() -> None:
    result = parse_transcript_course_records(_sample_course_text())

    assert result.records[1].course_name == "PENDIDIKAN ANTI KORUPSI DAN ETIK UMB"
    assert result.records[2].grade_letter == "B+"
    assert result.records[3].grade_letter == "A-"


def test_parse_transcript_course_records_returns_safe_error_when_no_courses_found() -> None:
    result = parse_transcript_course_records("TRANSKRIP SEMENTARA\nNIM: TST001")

    assert result.is_valid is False
    assert result.records == []
    assert result.errors[0].field == "courses"
    assert "could not be parsed" in result.errors[0].message


def test_parse_transcript_course_records_does_not_expose_stack_traces() -> None:
    result = parse_transcript_course_records("")
    response_text = str(result)

    assert "Traceback" not in response_text
    assert "ValueError" not in response_text


@pytest.mark.skipif(
    not LOCAL_TRANSCRIPT_PDF.exists(),
    reason="Local transcript PDF fixture is intentionally ignored by Git.",
)
def test_parse_course_records_from_local_transcript_pdf_fixture() -> None:
    extraction_result = extract_pdf_text_from_file(LOCAL_TRANSCRIPT_PDF)

    result = parse_transcript_course_records(extraction_result.text)

    assert extraction_result.is_valid is True
    assert result.is_valid is True
    assert result.row_count >= 1
    assert result.records[0].course_code
    assert result.records[0].course_name
    assert result.records[0].credits > 0


def _sample_course_text() -> str:
    return """
    NOSMTKODE MATA KULIAH SKSNHNB(SKSxNB)
    1 I F062100001DASAR KEAMANAN KOMPUTER  3 A 4.00 12.00
    2 II U002100010PENDIDIKAN ANTI KORUPSI DAN ETIK UMB  2 A 4.00 8.00
    3 II W152100004MATEMATIKA DISKRIT  3 B+3.50 10.50
    4 III W152100020KAPITA SELEKTA INFORMATIKA  3 A-3.70 11.10
    """
