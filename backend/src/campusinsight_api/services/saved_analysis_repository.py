import json
import sqlite3
from collections.abc import Iterable
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from campusinsight_api.domain.saved_analysis import SavedAnalysis, SavedAnalysisSummary

DEFAULT_DATABASE_PATH = (
    Path(__file__).resolve().parents[4] / "data" / "database" / "campusinsight.sqlite3"
)


class SavedAnalysisRepository:
    def __init__(self, database_path: Path = DEFAULT_DATABASE_PATH) -> None:
        self.database_path = database_path
        self.database_path.parent.mkdir(parents=True, exist_ok=True)
        self.initialize()

    def initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS saved_analyses (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    analysis_id TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    source_filename TEXT NOT NULL,
                    row_count INTEGER NOT NULL,
                    total_courses INTEGER NOT NULL,
                    weighted_gpa REAL NOT NULL,
                    average_score REAL NOT NULL,
                    analysis_json TEXT NOT NULL
                )
                """
            )

    def save(
        self,
        *,
        analysis_id: str,
        source_filename: str,
        row_count: int,
        total_courses: int,
        weighted_gpa: float,
        average_score: float,
        analysis: dict[str, Any],
        created_at: str | None = None,
    ) -> SavedAnalysisSummary:
        created_at = created_at or datetime.now(UTC).isoformat()
        safe_filename = _safe_filename(source_filename)
        analysis_json = json.dumps(analysis, sort_keys=True, separators=(",", ":"))

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO saved_analyses (
                    analysis_id,
                    created_at,
                    source_filename,
                    row_count,
                    total_courses,
                    weighted_gpa,
                    average_score,
                    analysis_json
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    analysis_id,
                    created_at,
                    safe_filename,
                    row_count,
                    total_courses,
                    weighted_gpa,
                    average_score,
                    analysis_json,
                ),
            )

        return SavedAnalysisSummary(
            analysis_id=analysis_id,
            created_at=created_at,
            source_filename=safe_filename,
            row_count=row_count,
            total_courses=total_courses,
            weighted_gpa=weighted_gpa,
            average_score=average_score,
        )

    def list(self, limit: int = 20) -> list[SavedAnalysisSummary]:
        safe_limit = max(1, min(limit, 100))
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT
                    analysis_id,
                    created_at,
                    source_filename,
                    row_count,
                    total_courses,
                    weighted_gpa,
                    average_score
                FROM saved_analyses
                ORDER BY created_at DESC, id DESC
                LIMIT ?
                """,
                (safe_limit,),
            ).fetchall()

        return [_summary_from_row(row) for row in rows]

    def get(self, analysis_id: str) -> SavedAnalysis | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT
                    analysis_id,
                    created_at,
                    source_filename,
                    row_count,
                    total_courses,
                    weighted_gpa,
                    average_score,
                    analysis_json
                FROM saved_analyses
                WHERE analysis_id = ?
                """,
                (analysis_id,),
            ).fetchone()

        if row is None:
            return None

        return SavedAnalysis(
            summary=_summary_from_row(row),
            analysis=json.loads(row["analysis_json"]),
        )

    def delete(self, analysis_id: str) -> bool:
        with self._connect() as connection:
            cursor = connection.execute(
                "DELETE FROM saved_analyses WHERE analysis_id = ?",
                (analysis_id,),
            )
            return cursor.rowcount > 0

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self.database_path)
        connection.row_factory = sqlite3.Row
        return connection


def _summary_from_row(row: sqlite3.Row) -> SavedAnalysisSummary:
    return SavedAnalysisSummary(
        analysis_id=row["analysis_id"],
        created_at=row["created_at"],
        source_filename=row["source_filename"],
        row_count=row["row_count"],
        total_courses=row["total_courses"],
        weighted_gpa=row["weighted_gpa"],
        average_score=row["average_score"],
    )


def _safe_filename(source_filename: str) -> str:
    filename = source_filename.replace("\\", "/").split("/")[-1].strip()
    return filename or "uploaded.csv"


def saved_analysis_summaries_to_dicts(
    summaries: Iterable[SavedAnalysisSummary],
) -> list[dict[str, Any]]:
    return [
        {
            "analysis_id": summary.analysis_id,
            "created_at": summary.created_at,
            "source_filename": summary.source_filename,
            "row_count": summary.row_count,
            "total_courses": summary.total_courses,
            "weighted_gpa": summary.weighted_gpa,
            "average_score": summary.average_score,
        }
        for summary in summaries
    ]
