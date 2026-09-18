export const CV_ANALYSIS_STATUSES = [
  "pending",
  "extracting",
  "analyzing",
  "completed",
  "failed"
] as const;

export type CvAnalysisStatus = (typeof CV_ANALYSIS_STATUSES)[number];

export type CvAnalysisVerdict =
  | "strong_match"
  | "good_match"
  | "partial_match"
  | "weak_match";

export type InterviewQuestionCategory =
  | "technical"
  | "behavioral"
  | "experience"
  | "gap_probe";

export type InterviewQuestion = {
  category: InterviewQuestionCategory;
  question: string;
  rationale: string;
};

export type CvAnalysisResult = {
  matchScore: number;
  verdict: CvAnalysisVerdict;
  summary: string;
  candidateProfile: {
    name: string | null;
    currentTitle: string | null;
    yearsOfExperience: number | null;
    location: string | null;
  };
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  gaps: string[];
  redFlags: string[];
  feedbackForCandidate: string[];
  interviewQuestions: InterviewQuestion[];
};

export type CvAnalysisFile = {
  id: string;
  originalName: string;
  mimeType: string;
  byteSize: number;
};

export type CvAnalysisListItem = {
  id: string;
  title: string;
  status: CvAnalysisStatus;
  progress: number;
  matchScore: number | null;
  errorMessage: string | null;
  cvFile: CvAnalysisFile;
  createdAt: string;
  updatedAt: string;
};

export type CvAnalysisDetail = {
  id: string;
  title: string;
  status: CvAnalysisStatus;
  progress: number;
  errorMessage: string | null;
  cvFile: CvAnalysisFile;
  jobDescriptionFile: CvAnalysisFile | null;
  jobDescriptionText: string | null;
  result: CvAnalysisResult | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateCvAnalysisInput = {
  title?: string;
  cv: File;
  jobDescriptionFile?: File | null;
  jobDescriptionText?: string;
};

export const isProcessing = (status: CvAnalysisStatus) =>
  status === "pending" || status === "extracting" || status === "analyzing";
