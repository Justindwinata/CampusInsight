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
    expect(screen.getByRole("button", { name: "Validate CSV" })).toBeInTheDocument();
  });

  it("displays success state for a valid CSV response", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: true,
        records: [
          {
            student_id: "S1001",
            student_name: "Alya Prameswari",
            semester: 1,
            academic_year: "2024/2025",
            course_code: "CS101",
            course_name: "Introduction to Programming",
            credits: 3,
            grade_letter: "A",
            grade_point: 4,
            score: 91,
          },
        ],
        errors: [],
        row_count: 1,
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Validate CSV" }));

    expect(await screen.findByText("CSV validation passed.")).toBeInTheDocument();
    expect(screen.getAllByText("sample.csv")).toHaveLength(2);
    expect(screen.getByText("Rows checked")).toBeInTheDocument();
    expect(screen.getByText("Records accepted")).toBeInTheDocument();
  });

  it("displays validation errors for an invalid CSV response", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: false,
        records: [],
        errors: [
          {
            row_number: 2,
            field: "score",
            message: "score must be between 0 and 100.",
          },
        ],
        row_count: 1,
      }),
    );
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Validate CSV" }));

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
          records: [],
          errors: [
            {
              row_number: null,
              field: "file",
              message: "Uploaded file must use a .csv extension.",
            },
          ],
          row_count: 0,
        },
        400,
      ),
    );
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Validate CSV" }));

    expect(await screen.findByText("CSV upload could not be validated.")).toBeInTheDocument();
    expect(screen.getByText("Uploaded file must use a .csv extension.")).toBeInTheDocument();
  });

  it("displays a safe network error", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Failed to fetch with stack details"));
    const user = userEvent.setup();
    render(<App />);

    await uploadCsv(user);
    await user.click(screen.getByRole("button", { name: "Validate CSV" }));

    expect(await screen.findByText("CSV upload could not be validated.")).toBeInTheDocument();
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
    await user.click(screen.getByRole("button", { name: "Validate CSV" }));

    expect(screen.getAllByText("Validating CSV...")).toHaveLength(2);

    resolveResponse(
      jsonResponse({
        is_valid: true,
        records: [],
        errors: [],
        row_count: 0,
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
