from dataclasses import dataclass
from typing import Any


@dataclass(frozen=True, slots=True)
class SavedAnalysisSummary:
    analysis_id: str
    created_at: str
    source_filename: str
    row_count: int
    total_courses: int
    weighted_gpa: float
    average_score: float


@dataclass(frozen=True, slots=True)
class SavedAnalysis:
    summary: SavedAnalysisSummary
    analysis: dict[str, Any]
