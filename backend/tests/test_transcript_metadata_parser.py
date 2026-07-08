from pathlib import Path

import pytest

from campusinsight_api.services.pdf_extraction import extract_pdf_text_from_file
from campusinsight_api.services.transcript_metadata_parser import parse_transcript_metadata

ROOT_DIR = Path(__file__).resolve().parents[2]
LOCAL_TRANSCRIPT_PDF = ROOT_DIR / "data" / "sample" / "Transkrip Mahasiswa.pdf"


def test_parse_transcript_metadata_from_text() -> None:
    result = parse_transcript_metadata(_sample_transcript_text())

    assert result.is_valid is True
    assert result.errors == []
    assert result.metadata is not None
    assert result.metadata.student_id == "TST23010001"
    assert result.metadata.student_name == "ALEX PRATAMA"
    assert result.metadata.faculty == "Ilmu Komputer"
    assert result.metadata.study_program == "Teknik Informatika"
    assert [semester.semester for semester in result.metadata.semesters] == [1, 2, 3]


def test_parse_transcript_metadata_collects_missing_field_errors() -> None:
    result = parse_transcript_metadata("TRANSKRIP SEMENTARA\nNAMA: ALEX PRATAMA")

    assert result.is_valid is False
    assert result.metadata is None
    assert {error.field for error in result.errors} == {
        "student_id",
        "faculty",
        "study_program",
        "semesters",
    }


def test_parse_transcript_metadata_does_not_expose_stack_traces() -> None:
    result = parse_transcript_metadata("")
    response_text = str(result)

    assert "Traceback" not in response_text
    assert "AttributeError" not in response_text
    assert "FileNotFoundError" not in response_text


@pytest.mark.skipif(
    not LOCAL_TRANSCRIPT_PDF.exists(),
    reason="Local transcript PDF fixture is intentionally ignored by Git.",
)
def test_parse_metadata_from_local_transcript_pdf_fixture() -> None:
    extraction_result = extract_pdf_text_from_file(LOCAL_TRANSCRIPT_PDF)

    result = parse_transcript_metadata(extraction_result.text)

    assert extraction_result.is_valid is True
    assert result.is_valid is True
    assert result.metadata is not None
    assert result.metadata.student_id
    assert result.metadata.student_name
    assert result.metadata.faculty
    assert result.metadata.study_program
    assert result.metadata.semesters


def _sample_transcript_text() -> str:
    return """
    TRANSKRIP SEMENTARA
    NIM: TST23010001 FAKULTAS : Ilmu Komputer
    NAMA: ALEX PRATAMA (Lapor BAP, Ijazah) PROGRAM STUDI: Teknik Informatika
    Tempat/Tgl Lahir : Jakarta, 01 Januari 2004
    NOSMTKODE MATA KULIAH SKSNHNB(SKSxNB)
    1 I F062100001DASAR KEAMANAN KOMPUTER 3 A 4.00 12.00
    2 II W152100004MATEMATIKA DISKRIT 3 B+3.50 10.50
    3 III W152100011SISTEM OPERASI 3 A 4.00 12.00
    """
