import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  analyzeAcademicRecordsCsv,
  analyzeAcademicRecordsFile,
  analyzeAcademicRecordsPdf,
  validateAcademicRecordsCsv,
} from "./academicRecordsService";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("academicRecordsService", () => {
  it("calls the validation endpoint with multipart form data", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({ is_valid: true, records: [], errors: [], row_count: 0 }),
    );

    await validateAcademicRecordsCsv(csvFile());

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/academic-records/validate",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
  });

  it("calls the analytics endpoint with multipart form data", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: true,
        validation: { row_count: 1, errors: [] },
        analytics: {
          gpa_summary: {
            total_courses: 1,
            total_credits: 3,
            weighted_gpa: 4,
            average_score: 91,
            highest_score: 91,
            lowest_score: 91,
            best_course: "CS101 - Introduction to Programming",
            weakest_course: "CS101 - Introduction to Programming",
          },
          semester_performance: [],
          grade_distribution: [],
          course_performance: [],
          credit_summary: {
            total_credits: 3,
            attempted_courses: 1,
            average_credits_per_course: 3,
          },
          course_risks: [],
        },
      }),
    );

    const result = await analyzeAcademicRecordsCsv(csvFile());

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/academic-records/analyze",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    expect(result.analytics?.gpa_summary.weighted_gpa).toBe(4);
  });

  it("calls the PDF analytics endpoint with multipart form data", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: true,
        validation: { row_count: 1, errors: [] },
        analytics: {
          gpa_summary: {
            total_courses: 1,
            total_credits: 3,
            weighted_gpa: 4,
            average_score: 100,
            highest_score: 100,
            lowest_score: 100,
            best_course: "F062100001 - DASAR KEAMANAN KOMPUTER",
            weakest_course: "F062100001 - DASAR KEAMANAN KOMPUTER",
          },
          semester_performance: [],
          grade_distribution: [],
          course_performance: [],
          credit_summary: {
            total_credits: 3,
            attempted_courses: 1,
            average_credits_per_course: 3,
          },
          course_risks: [],
        },
      }),
    );

    const result = await analyzeAcademicRecordsPdf(pdfFile());

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/academic-records/analyze-pdf",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    expect(result.analytics?.gpa_summary.average_score).toBe(100);
  });

  it("routes generic academic record analysis to PDF endpoint for PDF files", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: false,
        validation: { row_count: 0, errors: [] },
        analytics: null,
      }),
    );

    await analyzeAcademicRecordsFile(pdfFile());

    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/academic-records/analyze-pdf",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("returns invalid CSV analytics responses without throwing", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        is_valid: false,
        validation: {
          row_count: 1,
          errors: [{ row_number: 2, field: "score", message: "score must be between 0 and 100." }],
        },
        analytics: null,
      }),
    );

    const result = await analyzeAcademicRecordsCsv(csvFile());

    expect(result.is_valid).toBe(false);
    expect(result.analytics).toBeNull();
    expect(result.validation.errors[0].field).toBe("score");
  });

  it("throws safe upload errors for analytics HTTP failures", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse(
        {
          is_valid: false,
          validation: {
            row_count: 0,
            errors: [
              { row_number: null, field: "file", message: "Uploaded file must be a CSV file." },
            ],
          },
          analytics: null,
        },
        400,
      ),
    );

    await expect(analyzeAcademicRecordsCsv(csvFile())).rejects.toThrow(
      "Uploaded file must be a CSV file.",
    );
  });

  it("throws a safe network error for analytics requests", async () => {
    fetchMock.mockRejectedValueOnce(new Error("stack trace detail"));

    await expect(analyzeAcademicRecordsCsv(csvFile())).rejects.toThrow(
      "Unable to reach the CampusInsight API. Confirm the backend is running.",
    );
  });
});

function csvFile() {
  return new File(["student_id\nS1001\n"], "records.csv", { type: "text/csv" });
}

function pdfFile() {
  return new File(["%PDF-1.4"], "transcript.pdf", { type: "application/pdf" });
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
