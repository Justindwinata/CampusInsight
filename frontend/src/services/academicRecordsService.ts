export type AcademicRecord = {
  student_id: string;
  student_name: string;
  semester: number;
  academic_year: string;
  course_code: string;
  course_name: string;
  credits: number;
  grade_letter: string;
  grade_point: number;
  score: number;
};

export type ValidationError = {
  row_number: number | null;
  field: string | null;
  message: string;
};

export type AcademicRecordsValidationResult = {
  is_valid: boolean;
  records: AcademicRecord[];
  errors: ValidationError[];
  row_count: number;
};

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export async function validateAcademicRecordsCsv(
  file: File,
): Promise<AcademicRecordsValidationResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/academic-records/validate`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new Error("Unable to reach the CampusInsight API. Confirm the backend is running.");
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The CampusInsight API returned an unreadable response.");
  }

  if (!response.ok && isValidationResult(payload)) {
    throw new Error(
      payload.errors[0]?.message ??
        "The uploaded file could not be validated. Please check the file and retry.",
    );
  }

  if (!response.ok) {
    throw new Error("The uploaded file could not be validated. Please check the file and retry.");
  }

  if (isValidationResult(payload)) {
    return payload;
  }

  throw new Error("The CampusInsight API returned an unexpected validation response.");
}

function isValidationResult(value: unknown): value is AcademicRecordsValidationResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<AcademicRecordsValidationResult>;
  return (
    typeof result.is_valid === "boolean" &&
    Array.isArray(result.records) &&
    Array.isArray(result.errors) &&
    typeof result.row_count === "number"
  );
}
