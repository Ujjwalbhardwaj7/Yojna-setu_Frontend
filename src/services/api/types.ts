/** Finalized M2 transport contracts plus existing frontend presentation types. */

export interface FastAPIValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface ApiError { detail: string | FastAPIValidationError[]; }
export interface HealthResponse { status: string; app?: string; environment?: string; }

/** M2's authenticated current-user response. Additional safe fields may be added by M2. */
export interface AuthenticatedUser {
  id: string;
  email?: string | null;
  [key: string]: unknown;
}

export interface ProfileData {
  state?: string;
  age?: number;
  annual_income?: number;
  occupation?: string;
  education?: string;
  caste_category?: string;
  gender?: "male" | "female" | "other" | string;
  landholding_acres?: number;
  disability?: boolean;
  [key: string]: unknown;
}

/** JWT is the authority; user_id/profile_id never appear in frontend payloads. */
export interface ProfileCreateRequest { profile: ProfileData; }
export interface ProfileUpdateRequest { profile: Partial<ProfileData>; }
export interface CitizenProfile {
  profile: ProfileData;
  created_at?: string;
  updated_at?: string;
}

export interface SchemeSummary {
  scheme_code: string;
  name: string;
  description: string;
  ministry: string;
  department: string;
  scheme_type: string;
  status: string;
  aliases: string[];
  target_groups: string[];
  tags: string[];
  benefits: string;
  official_url: string;
  effective_from: string | null;
  effective_to: string | null;
  last_verified_at: string;
}

export interface SchemeDetail extends SchemeSummary {
  rules?: unknown[];
  exclusion_rules?: unknown[];
  documents?: DocumentItem[];
  tutorial_steps?: TutorialStep[];
  profile_fields?: string[];
  verification?: Record<string, unknown>;
}

export interface PaginatedSchemes { items: SchemeSummary[]; total: number; }
export interface SchemeListParams {
  scheme_type?: string;
  category?: string;
  status?: string;
  ministry?: string;
  search?: string;
  target_group?: string;
  state?: string;
  limit?: number;
  offset?: number;
  format?: "paged";
}

export interface EligibilityProfileSnapshot extends ProfileData {
  is_institutional_landholder?: boolean;
  holds_constitutional_post?: boolean;
  is_income_tax_payer?: boolean;
}
export interface EligibilityRequest { scheme_code: string; profile: EligibilityProfileSnapshot; }
export type EligibilityStatus = "Eligible" | "Potentially Eligible" | "Not Eligible";
export interface EvaluatedRule {
  rule_type: string;
  field: string;
  operator: string;
  expected: string;
  actual: string;
  passed: boolean;
  description: string;
}

/** Exact M2 eligibility decision shape: `status` comes from the rule engine. */
export interface EligibilityResponse {
  scheme_code: string;
  eligible: boolean | null;
  status: EligibilityStatus;
  reason_codes: string[];
  reasons: string[];
  missing_fields: string[];
  evaluated_rules: EvaluatedRule[];
}

export interface DocumentItem {
  document_name: string;
  document_type: string;
  is_mandatory: boolean;
  description: string;
}
export interface SchemeDocuments { scheme_code: string; documents: DocumentItem[]; }
export interface TutorialStep {
  step_number: number;
  title: string;
  description: string;
  tips: string;
  image_url?: string;
  highlighted_action?: string;
  warning?: string;
  official_url?: string;
}
export interface SchemeTutorial { scheme_code: string; steps: TutorialStep[]; }

export interface RecommendationRequest { profile: EligibilityProfileSnapshot; limit?: number; }

/** Final M2 recommendation transport item. It is deterministic metadata ranking, not M3 AI. */
export interface M2RecommendationItem {
  scheme_code: string;
  name: string;
  match_reasons: string[];
  score: number;
}
export interface M2RecommendationResponse {
  items: M2RecommendationItem[];
  total: number;
  disclaimer?: string;
}

/** Existing UI view model, enriched only with canonical scheme details from M2. */
export interface RecommendedSchemeItem {
  scheme: SchemeSummary;
  match_reasons: string[];
  score: number;
}
export interface RecommendationResponse {
  items: RecommendedSchemeItem[];
  total: number;
  disclaimer?: string;
}

/** M3-owned, intentionally isolated future search contract. */
export interface SchemeSearchResult {
  scheme: SchemeSummary;
  confidence: number;
  match_reason: string;
}
export interface SchemeSearchResponse {
  results: SchemeSearchResult[];
  clarifying_question?: string | null;
}

export class M3SearchUnavailableError extends Error {
  constructor() {
    super("Semantic scheme search is awaiting the Member 3 integration.");
    this.name = "M3SearchUnavailableError";
  }
}

/** Speech-to-text capability flags returned by the backend at /search/config. */
export interface TranscriptionConfig { server_stt_configured: boolean; }
export interface TranscriptionResponse { text: string; }
