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

export type GpaSummary = {
  total_courses: number;
  total_credits: number;
  weighted_gpa: number;
  average_score: number;
  highest_score: number;
  lowest_score: number;
  best_course: string | null;
  weakest_course: string | null;
};

export type SemesterPerformance = {
  semester: number;
  academic_year: string;
  course_count: number;
  credits: number;
  weighted_gpa: number;
  average_score: number;
};

export type GradeDistributionItem = {
  grade_letter: string;
  count: number;
  percentage: number;
};

export type CoursePerformanceItem = {
  course_code: string;
  course_name: string;
  credits: number;
  grade_letter: string;
  grade_point: number;
  score: number;
};

export type CreditSummary = {
  total_credits: number;
  attempted_courses: number;
  average_credits_per_course: number;
};

export type CourseRiskItem = {
  course_code: string;
  course_name: string;
  risk_level: "low" | "medium" | "high";
  reasons: string[];
};

export type AcademicAnalytics = {
  gpa_summary: GpaSummary;
  semester_performance: SemesterPerformance[];
  grade_distribution: GradeDistributionItem[];
  course_performance: CoursePerformanceItem[];
  credit_summary: CreditSummary;
  course_risks: CourseRiskItem[];
};

export type AcademicRecordsAnalysisResult = {
  analysis_id?: string;
  is_valid: boolean;
  validation: {
    row_count: number;
    errors: ValidationError[];
  };
  analytics: AcademicAnalytics | null;
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

export async function analyzeAcademicRecordsCsv(
  file: File,
): Promise<AcademicRecordsAnalysisResult> {
  return postAcademicRecordsAnalysis(file, "/academic-records/analyze", "CSV");
}

export async function analyzeAcademicRecordsPdf(
  file: File,
): Promise<AcademicRecordsAnalysisResult> {
  return postAcademicRecordsAnalysis(file, "/academic-records/analyze-pdf", "PDF");
}

export async function analyzeAcademicRecordsFile(
  file: File,
): Promise<AcademicRecordsAnalysisResult> {
  if (file.name.toLowerCase().endsWith(".pdf") || file.type === "application/pdf") {
    return analyzeAcademicRecordsPdf(file);
  }

  return analyzeAcademicRecordsCsv(file);
}

async function postAcademicRecordsAnalysis(
  file: File,
  endpoint: string,
  fileTypeLabel: "CSV" | "PDF",
): Promise<AcademicRecordsAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
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

  if (!response.ok && isAnalysisResult(payload)) {
    throw new Error(
      payload.validation.errors[0]?.message ??
        "The uploaded file could not be analyzed. Please check the file and retry.",
    );
  }

  if (!response.ok) {
    throw new Error(
      `The uploaded ${fileTypeLabel} file could not be analyzed. Please check the file and retry.`,
    );
  }

  if (isAnalysisResult(payload)) {
    return payload;
  }

  throw new Error("The CampusInsight API returned an unexpected analytics response.");
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

function isAnalysisResult(value: unknown): value is AcademicRecordsAnalysisResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const result = value as Partial<AcademicRecordsAnalysisResult>;
  const validation = result.validation as
    Partial<AcademicRecordsAnalysisResult["validation"]> | undefined;

  return (
    typeof result.is_valid === "boolean" &&
    !!validation &&
    typeof validation.row_count === "number" &&
    Array.isArray(validation.errors) &&
    (result.analytics === null || typeof result.analytics === "object")
  );
}
