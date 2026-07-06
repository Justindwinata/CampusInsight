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

    expect(screen.getByRole("heading", { name: "CampusInsight" })).toBeInTheDocument();
    expect(screen.getByText("This product is under active development.")).toBeInTheDocument();
    expect(screen.getByText("Backend status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Validate academic records" })).toBeInTheDocument();
    expect(
      screen.getByText(
        "Upload an academic records CSV to verify that it matches the CampusInsight schema.",
      ),
    ).toBeInTheDocument();
  });

  it("renders a file input and submit button", () => {
    render(<App />);

    expect(screen.getByLabelText("Academic records CSV file")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Analyze CSV" })).toBeInTheDocument();
  });

  it("displays success state and GPA summary for a valid analytics response", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(validAnalysisResponse()));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze CSV" }));

    expect(await screen.findByText("CSV validation passed.")).toBeInTheDocument();
    expect(screen.getAllByText("sample.csv")).toHaveLength(2);
    expect(screen.getByText("Rows checked")).toBeInTheDocument();
    expect(screen.getByText("Analytics status")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "GPA and credit summary" })).toBeInTheDocument();
    expect(screen.getByText("Weighted GPA")).toBeInTheDocument();
    expect(screen.getByText("3.11")).toBeInTheDocument();
    expect(screen.getByText("Total credits")).toBeInTheDocument();
    expect(screen.getByText("46")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "Analyze CSV" }));

    expect(await screen.findByText("CSV validation found issues.")).toBeInTheDocument();
    expect(screen.getByText("Row 2")).toBeInTheDocument();
    expect(screen.getAllByText("score")).toHaveLength(2);
    expect(screen.getByText("score must be between 0 and 100.")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "Analyze CSV" }));

    expect(await screen.findByText("CSV upload could not be analyzed.")).toBeInTheDocument();
    expect(screen.getByText("Uploaded file must use a .csv extension.")).toBeInTheDocument();
  });

  it("displays a safe network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Failed to fetch with stack details"));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Analyze CSV" }));

    expect(await screen.findByText("CSV upload could not be analyzed.")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "Analyze CSV" }));

    expect(screen.getAllByText("Analyzing CSV...")).toHaveLength(2);

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
      semester_performance: [],
      grade_distribution: [],
      course_performance: [],
      credit_summary: {
        total_credits: 46,
        attempted_courses: 16,
        average_credits_per_course: 2.88,
      },
      course_risks: [],
    },
  };
}

async function uploadCsv(user: ReturnType<typeof userEvent.setup>) {
  const file = new File(["student_id\nS1001\n"], "sample.csv", { type: "text/csv" });
  await user.upload(screen.getByLabelText("Academic records CSV file"), file);
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
