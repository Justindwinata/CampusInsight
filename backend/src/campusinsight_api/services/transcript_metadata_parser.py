from __future__ import annotations

import re
from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class TranscriptSemester:
    label: str
    semester: int


@dataclass(frozen=True, slots=True)
class TranscriptMetadata:
    student_name: str
    student_id: str
    faculty: str
    study_program: str
    semesters: list[TranscriptSemester]


@dataclass(frozen=True, slots=True)
class TranscriptMetadataParseError:
    field: str
    message: str


@dataclass(frozen=True, slots=True)
class TranscriptMetadataParseResult:
    is_valid: bool
    metadata: TranscriptMetadata | None
    errors: list[TranscriptMetadataParseError]


ROMAN_SEMESTERS = {
    "I": 1,
    "II": 2,
    "III": 3,
    "IV": 4,
    "V": 5,
    "VI": 6,
    "VII": 7,
    "VIII": 8,
}


def parse_transcript_metadata(text: str) -> TranscriptMetadataParseResult:
    normalized_text = _normalize_text(text)
    errors: list[TranscriptMetadataParseError] = []

    student_id = _match_field(normalized_text, r"\bNIM\s*:\s*([A-Za-z0-9.-]+)")
    student_name = _match_field(
        normalized_text,
        r"\bNAMA\s*:\s*(.+?)(?=\s*\(Lapor|\s*PROGRAM\s+STUDI\s*:|\s*Tempat/Tgl|$)",
    )
    faculty = _match_field(
        normalized_text,
        r"\bFAKULTAS\s*:\s*(.+?)(?=\s*NAMA\s*:|\s*PROGRAM\s+STUDI\s*:|\s*Tempat/Tgl|$)",
    )
    study_program = _match_field(
        normalized_text,
        r"\bPROGRAM\s+STUDI\s*:\s*(.+?)(?=\s*Tempat/Tgl|\s*NOSMT|\s*\d+\s+[IVX]+\s+|$)",
    )
    semesters = _parse_semesters(normalized_text)

    required_fields = {
        "student_id": student_id,
        "student_name": student_name,
        "faculty": faculty,
        "study_program": study_program,
    }
    for field, value in required_fields.items():
        if not value:
            errors.append(
                TranscriptMetadataParseError(
                    field=field,
                    message=f"{field} could not be parsed from the transcript text.",
                )
            )

    if not semesters:
        errors.append(
            TranscriptMetadataParseError(
                field="semesters",
                message="Semester information could not be parsed from the transcript text.",
            )
        )

    if errors:
        return TranscriptMetadataParseResult(is_valid=False, metadata=None, errors=errors)

    return TranscriptMetadataParseResult(
        is_valid=True,
        metadata=TranscriptMetadata(
            student_name=student_name or "",
            student_id=student_id or "",
            faculty=faculty or "",
            study_program=study_program or "",
            semesters=semesters,
        ),
        errors=[],
    )


def _normalize_text(text: str) -> str:
    return re.sub(r"[ \t]+", " ", text.replace("\r\n", "\n").replace("\r", "\n")).strip()


def _match_field(text: str, pattern: str) -> str | None:
    match = re.search(pattern, text, flags=re.IGNORECASE | re.DOTALL)
    if not match:
        return None
    return _clean_value(match.group(1))


def _parse_semesters(text: str) -> list[TranscriptSemester]:
    semester_labels = re.findall(r"(?m)^\s*\d+\s+([IVX]+)\s+[A-Z]\d{9}", text)
    seen: set[str] = set()
    semesters: list[TranscriptSemester] = []

    for label in semester_labels:
        normalized_label = label.upper()
        semester_number = ROMAN_SEMESTERS.get(normalized_label)
        if semester_number is None or normalized_label in seen:
            continue
        seen.add(normalized_label)
        semesters.append(TranscriptSemester(label=normalized_label, semester=semester_number))

    return semesters


def _clean_value(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip(" :-")
