from datetime import UTC, datetime
from html import escape
from typing import Any

from campusinsight_api.domain.saved_analysis import SavedAnalysis


def render_saved_analysis_html_report(
    saved_analysis: SavedAnalysis,
    generated_at: datetime | None = None,
) -> str:
    generated_at = generated_at or datetime.now(UTC)
    analysis = saved_analysis.analysis
    analytics = _mapping(analysis.get("analytics"))
    validation = _mapping(analysis.get("validation"))

    return f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CampusInsight Academic Report</title>
  <style>
    body {{
      margin: 0;
      color: #17202a;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      line-height: 1.5;
    }}
    main {{
      max-width: 1040px;
      margin: 0 auto;
      padding: 32px 24px;
    }}
    h1, h2, h3 {{
      color: #111827;
      line-height: 1.2;
    }}
    h1 {{
      margin: 0 0 8px;
      font-size: 32px;
    }}
    h2 {{
      margin-top: 32px;
      border-bottom: 2px solid #dfe5ee;
      padding-bottom: 8px;
      font-size: 22px;
    }}
    .meta-grid, .summary-grid {{
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
      margin-top: 18px;
    }}
    .card {{
      border: 1px solid #dfe5ee;
      border-radius: 6px;
      padding: 12px;
      background: #fbfcfe;
      overflow-wrap: anywhere;
    }}
    .label {{
      display: block;
      color: #5d6878;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
    }}
    .value {{
      display: block;
      margin-top: 6px;
      font-size: 18px;
      font-weight: 700;
    }}
    table {{
      width: 100%;
      border-collapse: collapse;
      margin-top: 14px;
      font-size: 14px;
    }}
    th, td {{
      border: 1px solid #dfe5ee;
      padding: 9px 10px;
      text-align: left;
      vertical-align: top;
    }}
    th {{
      background: #f4f7fa;
      color: #334155;
    }}
    ul {{
      margin: 10px 0 0;
      padding-left: 20px;
    }}
    .note {{
      margin-top: 28px;
      padding: 14px;
      border: 1px solid #e6c36f;
      border-radius: 6px;
      background: #fff9e8;
    }}
    @media print {{
      main {{
        padding: 16px;
      }}
      .card, .note, table {{
        break-inside: avoid;
      }}
    }}
  </style>
</head>
<body>
  <main>
    <header>
      <h1>CampusInsight Academic Report</h1>
      <p>Standalone report generated from a saved academic analysis.</p>
    </header>

    <section aria-labelledby="report-metadata-title">
      <h2 id="report-metadata-title">Report Metadata</h2>
      <div class="meta-grid">
        {_metadata_card("Generated", generated_at.isoformat())}
        {_metadata_card("Analysis ID", saved_analysis.summary.analysis_id)}
        {_metadata_card("Source file", saved_analysis.summary.source_filename)}
        {
        _metadata_card(
            "Rows checked",
            validation.get("row_count", saved_analysis.summary.row_count),
        )
    }
      </div>
    </section>

    {_gpa_summary_section(_mapping(analytics.get("gpa_summary")))}
    {_credit_summary_section(_mapping(analytics.get("credit_summary")))}
    {_semester_section(_list(analytics.get("semester_performance")))}
    {_grade_distribution_section(_list(analytics.get("grade_distribution")))}
    {_course_performance_section(_list(analytics.get("course_performance")))}
    {_course_risk_section(_list(analytics.get("course_risks")))}

    <section aria-labelledby="limitations-title" class="note">
      <h2 id="limitations-title">Limitations and Safety Notes</h2>
      <p>
        This report is generated from stored canonical CampusInsight analytics JSON. It does not
        include uploaded CSV content, does not recalculate analytics, does not use AI, and does not
        predict academic outcomes.
      </p>
    </section>
  </main>
</body>
</html>"""


def _metadata_card(label: str, value: object) -> str:
    return (
        '<div class="card">'
        f'<span class="label">{_escape(label)}</span>'
        f'<span class="value">{_escape(value)}</span>'
        "</div>"
    )


def _gpa_summary_section(summary: dict[str, Any]) -> str:
    cards = [
        ("Total courses", summary.get("total_courses", "Not available")),
        ("Total credits", summary.get("total_credits", "Not available")),
        ("Weighted GPA", summary.get("weighted_gpa", "Not available")),
        ("Average score", summary.get("average_score", "Not available")),
        ("Highest score", summary.get("highest_score", "Not available")),
        ("Lowest score", summary.get("lowest_score", "Not available")),
        ("Best course", summary.get("best_course", "Not available")),
        ("Weakest course", summary.get("weakest_course", "Not available")),
    ]
    return (
        '<section aria-labelledby="gpa-summary-title">'
        '<h2 id="gpa-summary-title">GPA Summary</h2>'
        '<div class="summary-grid">'
        + "".join(_metadata_card(label, value) for label, value in cards)
        + "</div></section>"
    )


def _credit_summary_section(summary: dict[str, Any]) -> str:
    cards = [
        ("Total credits", summary.get("total_credits", "Not available")),
        ("Attempted courses", summary.get("attempted_courses", "Not available")),
        ("Average credits per course", summary.get("average_credits_per_course", "Not available")),
    ]
    return (
        '<section aria-labelledby="credit-summary-title">'
        '<h2 id="credit-summary-title">Credit Summary</h2>'
        '<div class="summary-grid">'
        + "".join(_metadata_card(label, value) for label, value in cards)
        + "</div></section>"
    )


def _semester_section(rows: list[dict[str, Any]]) -> str:
    return _table_section(
        "semester-performance-title",
        "Semester Performance",
        ["Semester", "Academic year", "Course count", "Credits", "Weighted GPA", "Average score"],
        [
            [
                row.get("semester", ""),
                row.get("academic_year", ""),
                row.get("course_count", ""),
                row.get("credits", ""),
                row.get("weighted_gpa", ""),
                row.get("average_score", ""),
            ]
            for row in rows
        ],
    )


def _grade_distribution_section(rows: list[dict[str, Any]]) -> str:
    return _table_section(
        "grade-distribution-title",
        "Grade Distribution",
        ["Grade letter", "Count", "Percentage"],
        [
            [row.get("grade_letter", ""), row.get("count", ""), row.get("percentage", "")]
            for row in rows
        ],
    )


def _course_performance_section(rows: list[dict[str, Any]]) -> str:
    return _table_section(
        "course-performance-title",
        "Course Performance",
        ["Course code", "Course name", "Credits", "Grade letter", "Grade point", "Score"],
        [
            [
                row.get("course_code", ""),
                row.get("course_name", ""),
                row.get("credits", ""),
                row.get("grade_letter", ""),
                row.get("grade_point", ""),
                row.get("score", ""),
            ]
            for row in rows
        ],
    )


def _course_risk_section(rows: list[dict[str, Any]]) -> str:
    if not rows:
        return (
            '<section aria-labelledby="course-risk-title">'
            '<h2 id="course-risk-title">Course Risk Review</h2>'
            "<p>No lower performance signals were saved for this analysis.</p>"
            "</section>"
        )

    items = []
    for row in rows:
        reasons = "".join(f"<li>{_escape(reason)}</li>" for reason in _list(row.get("reasons")))
        items.append(
            "<tr>"
            f"<td>{_escape(row.get('course_code', ''))}</td>"
            f"<td>{_escape(row.get('course_name', ''))}</td>"
            f"<td>{_escape(row.get('risk_level', ''))}</td>"
            f"<td><ul>{reasons}</ul></td>"
            "</tr>"
        )

    return (
        '<section aria-labelledby="course-risk-title">'
        '<h2 id="course-risk-title">Course Risk Review</h2>'
        "<table><thead><tr><th>Course code</th><th>Course name</th>"
        "<th>Risk level</th><th>Review reasons</th></tr></thead><tbody>"
        + "".join(items)
        + "</tbody></table></section>"
    )


def _table_section(
    section_id: str,
    title: str,
    headers: list[str],
    rows: list[list[object]],
) -> str:
    body = (
        "".join(
            "<tr>" + "".join(f"<td>{_escape(cell)}</td>" for cell in row) + "</tr>" for row in rows
        )
        or f'<tr><td colspan="{len(headers)}">No saved records available.</td></tr>'
    )
    return (
        f'<section aria-labelledby="{_escape(section_id)}">'
        f'<h2 id="{_escape(section_id)}">{_escape(title)}</h2>'
        "<table><thead><tr>"
        + "".join(f"<th>{_escape(header)}</th>" for header in headers)
        + "</tr></thead><tbody>"
        + body
        + "</tbody></table></section>"
    )


def _mapping(value: object) -> dict[str, Any]:
    return value if isinstance(value, dict) else {}


def _list(value: object) -> list:
    return value if isinstance(value, list) else []


def _escape(value: object) -> str:
    if value is None:
        return ""
    return escape(str(value), quote=True)
