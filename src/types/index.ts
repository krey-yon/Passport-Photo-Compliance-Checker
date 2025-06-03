export interface Country {
  code: string;
  name: string;
  flag: string;
}

export interface ComplianceCheck {
  category: string;
  status: "pass" | "warning" | "fail";
  message: string;
  suggestion?: string;
}

export interface ComplianceResult {
  overallScore: number;
  checks: Array<{
    category: string;
    status: "pass" | "warning" | "fail";
    message: string;
    failMessage?: string | null;
    warningMessage?: string | null;
    suggestion: string;
  }>;
  recommendations?: string[];
  countrySpecificNotes?: string[];
}
