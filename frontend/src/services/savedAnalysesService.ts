import { AcademicRecordsAnalysisResult, API_BASE_URL } from "./academicRecordsService";

export type SavedAnalysisSummary = {
  analysis_id: string;
  created_at: string;
  source_filename: string;
  row_count: number;
  total_courses: number;
  weighted_gpa: number;
  average_score: number;
};

export type SavedAnalysesListResponse = {
  analyses: SavedAnalysisSummary[];
  limit: number;
};

export type DeleteSavedAnalysisResponse = {
  deleted: boolean;
  analysis_id: string;
};

export async function listSavedAnalyses(): Promise<SavedAnalysesListResponse> {
  const payload = await requestJson(`${API_BASE_URL}/analyses`, {
    method: "GET",
  });

  if (isSavedAnalysesListResponse(payload)) {
    return payload;
  }

  throw new Error("The CampusInsight API returned an unexpected saved analyses response.");
}

export async function getSavedAnalysis(analysisId: string): Promise<AcademicRecordsAnalysisResult> {
  const payload = await requestJson(`${API_BASE_URL}/analyses/${encodeURIComponent(analysisId)}`, {
    method: "GET",
  });

  if (isAnalysisResult(payload)) {
    return payload;
  }

  throw new Error("The CampusInsight API returned an unexpected saved analysis response.");
}

export async function deleteSavedAnalysis(
  analysisId: string,
): Promise<DeleteSavedAnalysisResponse> {
  const payload = await requestJson(`${API_BASE_URL}/analyses/${encodeURIComponent(analysisId)}`, {
    method: "DELETE",
  });

  if (isDeleteSavedAnalysisResponse(payload)) {
    return payload;
  }

  throw new Error("The CampusInsight API returned an unexpected delete response.");
}

async function requestJson(url: string, init: RequestInit): Promise<unknown> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch {
    throw new Error("Unable to reach the CampusInsight API. Confirm the backend is running.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The CampusInsight API returned an unreadable response.");
  }

  if (!response.ok) {
    throw new Error(safeErrorMessage(payload, response.status));
  }

  return payload;
}

function safeErrorMessage(payload: unknown, status: number): string {
  if (isDetailResponse(payload) && payload.detail) {
    return payload.detail;
  }

  if (status === 404) {
    return "Saved analysis was not found.";
  }

  return "Saved analyses are currently unavailable. Please retry.";
}

function isSavedAnalysesListResponse(value: unknown): value is SavedAnalysesListResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<SavedAnalysesListResponse>;
  return Array.isArray(response.analyses) && typeof response.limit === "number";
}

function isAnalysisResult(value: unknown): value is AcademicRecordsAnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<AcademicRecordsAnalysisResult>;
  const validation = response.validation as
    Partial<AcademicRecordsAnalysisResult["validation"]> | undefined;

  return (
    typeof response.is_valid === "boolean" &&
    !!validation &&
    typeof validation.row_count === "number" &&
    Array.isArray(validation.errors) &&
    (response.analytics === null || typeof response.analytics === "object")
  );
}

function isDeleteSavedAnalysisResponse(value: unknown): value is DeleteSavedAnalysisResponse {
  if (!value || typeof value !== "object") {
    return false;
  }

  const response = value as Partial<DeleteSavedAnalysisResponse>;
  return response.deleted === true && typeof response.analysis_id === "string";
}

function isDetailResponse(value: unknown): value is { detail: string } {
  return !!value && typeof value === "object" && typeof (value as { detail?: unknown }).detail === "string";
}
