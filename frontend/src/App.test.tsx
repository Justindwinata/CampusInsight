import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import App from "./App";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("App", () => {
  it("renders the CampusInsight foundation page and upload section", () => {
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "CampusInsight turns academic records into review-ready dashboards.",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Analyze academic records" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View saved analyses" })).toBeInTheDocument();
    expect(screen.getByText("CSV academic records")).toBeInTheDocument();
    expect(screen.getByText("PDF transcript text")).toBeInTheDocument();
    expect(screen.getByText("Product status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Validate academic records" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Upload an academic records CSV or supported transcript PDF to prepare deterministic analytics.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a file input and submit button", () => {
    render(<App />);

    expect(screen.getByLabelText("Academic records CSV or PDF file")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze file" })).toBeInTheDocument();
  });

  it("renders the saved analyses section", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "Saved analyses" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Load saved analyses" })).toBeInTheDocument();
    expect(screen.queryByText("records.csv")).not.toBeInTheDocument();
  });

  it("displays empty saved analyses state", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ analyses: [], limit: 20 }));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));

    expect(await screen.findByText("No saved analyses yet.")).toBeInTheDocument();
    expect(
      screen.getByText("Run a valid CSV or PDF analysis to save a local history entry."),
    ).toBeInTheDocument();
  });

  it("loads and displays saved analysis summaries", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(savedHistoryResponse()));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/analyses", {
      method: "GET",
    });
    expect(await screen.findByText("records.csv")).toBeInTheDocument();
    expect(screen.getByText("2026-07-06T08:00:00+00:00")).toBeInTheDocument();
    expect(screen.getByText("Rows")).toBeInTheDocument();
    expect(screen.getAllByText("16")).toHaveLength(2);
  });

  it("deletes a saved analysis item", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse({ deleted: true, analysis_id: "analysis-001" }));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Delete saved analysis records.csv" }));

    expect(fetchMock).toHaveBeenLastCalledWith("http://127.0.0.1:8000/analyses/analysis-001", {
      method: "DELETE",
    });
    expect(screen.queryByText("records.csv")).not.toBeInTheDocument();
  });

  it("clears saved detail when deleting the selected saved analysis", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse(savedDetailResponse()))
      .mockResolvedValueOnce(jsonResponse({ deleted: true, analysis_id: "analysis-001" }));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));
    await screen.findByRole("heading", { name: "Saved analysis dashboard" });
    await user.click(screen.getByRole("button", { name: "Delete saved analysis records.csv" }));

    expect(
      screen.queryByRole("heading", { name: "Saved analysis dashboard" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("analysis-001")).not.toBeInTheDocument();
  });

  it("loads saved analysis detail and displays metadata shell", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse(savedDetailResponse()));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    expect(fetchMock).toHaveBeenLastCalledWith("http://127.0.0.1:8000/analyses/analysis-001", {
      method: "GET",
    });
    expect(
      await screen.findByRole("heading", { name: "Saved Analysis Detail" }),
    ).toBeInTheDocument();
    expect(screen.getByText("analysis-001")).toBeInTheDocument();
    expect(screen.getByText("Source file")).toBeInTheDocument();
    expect(screen.getByText("Created at")).toBeInTheDocument();
    expect(screen.getByText("Saved detail loaded.")).toBeInTheDocument();
    expect(screen.getByText(/saved dashboard is displayed below/)).toBeInTheDocument();
  });

  it("shows loading state while saved detail loads", async () => {
    let resolveDetail: (response: Response) => void = () => undefined;
    fetchMock.mockResolvedValueOnce(jsonResponse(savedHistoryResponse())).mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveDetail = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    expect(screen.getByText("Loading saved detail...")).toBeInTheDocument();

    resolveDetail(jsonResponse(savedDetailResponse()));
    expect(await screen.findByText("Saved detail loaded.")).toBeInTheDocument();
  });

  it("displays safe not found state for saved detail", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse({ detail: "Saved analysis was not found." }, 404));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    expect(await screen.findByText("Saved detail could not be loaded.")).toBeInTheDocument();
    expect(screen.getByText("Saved analysis was not found.")).toBeInTheDocument();
    expect(screen.queryByText(/Traceback/i)).not.toBeInTheDocument();
  });

  it("displays saved detail backend error and supports retry", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockRejectedValueOnce(new Error("stack trace detail"))
      .mockResolvedValueOnce(jsonResponse(savedDetailResponse()));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    expect(await screen.findByText("Saved detail could not be loaded.")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to reach the CampusInsight API. Confirm the backend is running."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/stack trace detail/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Retry saved detail" }));

    expect(await screen.findByText("Saved detail loaded.")).toBeInTheDocument();
  });

  it("renders full saved analytics dashboard from stored detail", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse(savedDetailResponse()));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    expect(
      await screen.findByRole("heading", { name: "Saved analysis dashboard" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Viewing saved analysis")).toBeInTheDocument();
    expect(screen.getByText("Academic record validation passed.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GPA and credit summary" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Analytics charts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Semester Performance" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grade Distribution" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Course Performance" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Courses that may need attention" }),
    ).toBeInTheDocument();
  });

  it("shows html report action after saved detail loads", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse(savedDetailResponse()));
    const user = userEvent.setup();
    render(<App />);

    expect(
      screen.queryByRole("link", { name: /Download HTML report for saved analysis/i }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    const reportLink = await screen.findByRole("link", {
      name: "Download HTML report for saved analysis analysis-001",
    });
    expect(reportLink).toHaveAttribute(
      "href",
      "http://127.0.0.1:8000/analyses/analysis-001/report.html",
    );
    expect(reportLink).toHaveAttribute("target", "_blank");
  });

  it("does not call analyze endpoint when opening saved detail", async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(savedHistoryResponse()))
      .mockResolvedValueOnce(jsonResponse(savedDetailResponse()));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));
    await screen.findByRole("heading", { name: "Saved analysis dashboard" });

    expect(
      fetchMock.mock.calls.some(([url]) => String(url).includes("/academic-records/analyze")),
    ).toBe(false);
  });

  it("shows safe fallback for saved detail without displayable analytics", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(savedHistoryResponse())).mockResolvedValueOnce(
      jsonResponse({
        analysis_id: "analysis-001",
        is_valid: false,
        validation: { row_count: 1, errors: [] },
        analytics: null,
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));
    await screen.findByText("records.csv");
    await user.click(screen.getByRole("button", { name: "Open detail" }));

    expect(await screen.findByText("Saved analysis cannot be displayed.")).toBeInTheDocument();
    expect(
      screen.getByText("The stored response does not include displayable analytics data."),
    ).toBeInTheDocument();
  });

  it("displays a safe saved analyses backend error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("stack trace detail"));
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Load saved analyses" }));

    expect(await screen.findByText("Saved analyses could not be loaded.")).toBeInTheDocument();
    expect(
      screen.getByText("Unable to reach the CampusInsight API. Confirm the backend is running."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/stack trace detail/i)).not.toBeInTheDocument();
  });

  it("displays success state and GPA summary for a valid analytics response", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(await screen.findByText("Academic record validation passed.")).toBeInTheDocument();
    expect(screen.getByText("sample.csv")).toBeInTheDocument();
    expect(screen.getByText("sample.csv (CSV)")).toBeInTheDocument();
    expect(screen.getByText("Rows checked")).toBeInTheDocument();
    expect(screen.getByText("Analytics status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GPA and credit summary" })).toBeInTheDocument();
    expect(screen.getByText("Weighted GPA")).toBeInTheDocument();
    expect(screen.getByText("3.11")).toBeInTheDocument();
    expect(screen.getByText("Total credits")).toBeInTheDocument();
    expect(screen.getByText("46")).toBeInTheDocument();
  });

  it("supports PDF transcript uploads through the PDF analysis endpoint", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    const file = new File(["%PDF-1.4"], "transcript.pdf", { type: "application/pdf" });
    await user.upload(screen.getByLabelText("Academic records CSV or PDF file"), file);

    expect(screen.getByText("transcript.pdf (PDF)")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/academic-records/analyze-pdf",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    expect(await screen.findByText("Academic record validation passed.")).toBeInTheDocument();
  });

  it("displays semester, grade distribution, and course performance tables", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(
      await screen.findByRole("heading", { name: "Semester Performance" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Academic year" })).toBeInTheDocument();
    expect(screen.getByText("2024/2025")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Grade Distribution" })).toBeInTheDocument();
    expect(screen.getAllByRole("columnheader", { name: "Grade letter" })).toHaveLength(2);
    expect(screen.getByText("18.75%")).toBeInTheDocument();

    expect(screen.getByRole("heading", { name: "Course Performance" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Course code" })).toBeInTheDocument();
    expect(screen.getAllByText("CS101")).toHaveLength(2);
    expect(screen.getAllByText("Introduction to Programming")).toHaveLength(2);
  });

  it("displays the semester performance chart after valid analysis", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(await screen.findByRole("heading", { name: "Analytics charts" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Semester Performance Chart" })).toBeInTheDocument();
    expect(
      screen.getByLabelText(
        "Semester performance chart comparing GPA, average score, and credits.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Semester Performance" })).toBeInTheDocument();
  });

  it("displays grade distribution and course score charts after valid analysis", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(
      await screen.findByRole("heading", { name: "Grade Distribution Chart" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Course Score Overview" })).toBeInTheDocument();
    expect(
      screen.getByLabelText("Grade distribution chart showing course counts by grade letter."),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText("Course score overview chart showing scores by course code."),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Grade Distribution" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Course Performance" })).toBeInTheDocument();
  });

  it("displays course risk review with safe language", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(
      await screen.findByRole("heading", { name: "Courses that may need attention" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Risk level: high")).toBeInTheDocument();
    expect(screen.getByText("Review recommended")).toBeInTheDocument();
    expect(screen.getByText("Score is below 70.")).toBeInTheDocument();
    expect(screen.getByText("This course may need attention.")).toBeInTheDocument();
  });

  it("displays validation errors for an invalid CSV response", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: false,
        validation: {
          row_count: 1,
          errors: [
            {
              row_number: 2,
              field: "score",
              message: "score must be between 0 and 100.",
            },
          ],
        },
        analytics: null,
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(await screen.findByText("Academic record validation found issues.")).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();
    expect(screen.getAllByText("score")).toHaveLength(2);
    expect(screen.getByText("score must be between 0 and 100.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Analytics charts" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Semester Performance Chart" }),
    ).not.toBeInTheDocument();
  });

  it("displays a safe backend 400 error", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          is_valid: false,
          validation: {
            row_count: 0,
            errors: [
              {
                row_number: null,
                field: "file",
                message: "Uploaded file must use a .csv extension.",
              },
            ],
          },
          analytics: null,
        },
        400,
      ),
    );
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(
      await screen.findByText("Academic records upload could not be analyzed."),
    ).toBeInTheDocument();
    expect(screen.getByText("Uploaded file must use a .csv extension.")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Analytics charts" })).not.toBeInTheDocument();
  });

  it("displays a safe network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Failed to fetch with stack details"));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(
      await screen.findByText("Academic records upload could not be analyzed."),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Unable to reach the CampusInsight API. Confirm the backend is running."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/stack details/i)).not.toBeInTheDocument();
  });

  it("announces loading state while validation is running", async () => {
    let resolveResponse: (response: Response) => void = () => undefined;
    fetchMock.mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        resolveResponse = resolve;
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze file" }));

    expect(screen.getAllByText("Analyzing file...")).toHaveLength(2);

    resolveResponse(
      jsonResponse({
        is_valid: true,
        validation: { row_count: 0, errors: [] },
        analytics: null,
      }),
    );
  });

  it("does not display fake analytics numbers", () => {
    render(<App />);

    expect(screen.queryByText("3.80")).not.toBeInTheDocument();
    expect(screen.queryByText("92%")).not.toBeInTheDocument();
    expect(screen.queryByText("4.0 GPA")).not.toBeInTheDocument();
  });

  it("does not render charts before analysis or failure prediction wording", () => {
    const { container } = render(<App />);

    expect(container.querySelector("canvas")).not.toBeInTheDocument();
    expect(container.querySelector("svg")).not.toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Analytics charts" })).not.toBeInTheDocument();
    expect(screen.queryByText(/student will fail/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/bad student/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/guaranteed failure/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/academic failure prediction/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bpredict\b/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/\bAI\b/)).not.toBeInTheDocument();
    expect(screen.queryByText(/PDF export/i)).not.toBeInTheDocument();
  });
});

function validAnalysisResponse() {
  return {
    is_valid: true,
    validation: { row_count: 16, errors: [] },
    analytics: {
      gpa_summary: {
        total_courses: 16,
        total_credits: 46,
        weighted_gpa: 3.11,
        average_score: 80,
        highest_score: 94,
        lowest_score: 66,
        best_course: "CS102 - Data Structures",
        weakest_course: "CS101 - Introduction to Programming",
      },
      semester_performance: [
        {
          semester: 1,
          academic_year: "2024/2025",
          course_count: 8,
          credits: 24,
          weighted_gpa: 3.15,
          average_score: 79.88,
        },
      ],
      grade_distribution: [{ grade_letter: "A", count: 3, percentage: 18.75 }],
      course_performance: [
        {
          course_code: "CS101",
          course_name: "Introduction to Programming",
          credits: 3,
          grade_letter: "A",
          grade_point: 4,
          score: 91,
        },
      ],
      credit_summary: {
        total_credits: 46,
        attempted_courses: 16,
        average_credits_per_course: 2.88,
      },
      course_risks: [
        {
          course_code: "CS101",
          course_name: "Introduction to Programming",
          risk_level: "high",
          reasons: ["Score is below 70.", "Grade point is below 2.5."],
        },
      ],
    },
  };
}

function savedHistoryResponse() {
  return {
    analyses: [
      {
        analysis_id: "analysis-001",
        created_at: "2026-07-06T08:00:00+00:00",
        source_filename: "records.csv",
        row_count: 16,
        total_courses: 16,
        weighted_gpa: 3.11,
        average_score: 80,
      },
    ],
    limit: 20,
  };
}

function savedDetailResponse() {
  return {
    analysis_id: "analysis-001",
    ...validAnalysisResponse(),
  };
}

async function uploadCsv(user: ReturnType<typeof userEvent.setup>) {
  const file = new File(["student_id\nS1001\n"], "sample.csv", { type: "text/csv" });
  await user.upload(screen.getByLabelText("Academic records CSV or PDF file"), file);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
