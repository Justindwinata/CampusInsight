import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { deleteSavedAnalysis, getSavedAnalysis, listSavedAnalyses } from "./savedAnalysesService";

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("savedAnalysesService", () => {
  it("lists saved analyses from the history endpoint", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
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
      }),
    );

    const response = await listSavedAnalyses();

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/analyses", {
      method: "GET",
    });
    expect(response.analyses[0].analysis_id).toBe("analysis-001");
  });

  it("loads a saved analysis detail response", async () => {
    fetchMock.mockResolvedValueOnce(
      jsonResponse({
        analysis_id: "analysis-001",
        is_valid: true,
        validation: { row_count: 16, errors: [] },
        analytics: null,
      }),
    );

    const response = await getSavedAnalysis("analysis-001");

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/analyses/analysis-001", {
      method: "GET",
    });
    expect(response.is_valid).toBe(true);
  });

  it("deletes a saved analysis", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ deleted: true, analysis_id: "analysis-001" }));

    const response = await deleteSavedAnalysis("analysis-001");

    expect(fetchMock).toHaveBeenCalledWith("http://127.0.0.1:8000/analyses/analysis-001", {
      method: "DELETE",
    });
    expect(response.deleted).toBe(true);
  });

  it("throws safe errors for missing saved analyses", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse({ detail: "Saved analysis was not found." }, 404));

    await expect(getSavedAnalysis("missing")).rejects.toThrow("Saved analysis was not found.");
  });

  it("throws safe network errors", async () => {
    fetchMock.mockRejectedValueOnce(new Error("stack trace detail"));

    await expect(listSavedAnalyses()).rejects.toThrow(
      "Unable to reach the CampusInsight API. Confirm the backend is running.",
    );
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
