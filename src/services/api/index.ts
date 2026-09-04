/** Finalized M2 API adapter. Components import only from ./service. */
import { apiClient } from "./client";
import type {
  AuthenticatedUser, CitizenProfile, EligibilityRequest, EligibilityResponse, HealthResponse,
  M2RecommendationResponse, PaginatedSchemes, ProfileCreateRequest, ProfileUpdateRequest,
  RecommendationRequest, RecommendationResponse, SchemeDetail, SchemeListParams, SchemeSummary,
  SchemeDocuments, SchemeTutorial,
} from "./types";

const API_PREFIX = "/api/v1";

export async function healthCheck(): Promise<HealthResponse> {
  return (await apiClient.get<HealthResponse>("/health")).data;
}

export async function getCurrentUser(): Promise<AuthenticatedUser> {
  return (await apiClient.get<AuthenticatedUser>(`${API_PREFIX}/auth/me`)).data;
}

export async function createProfile(request: ProfileCreateRequest): Promise<CitizenProfile> {
  return (await apiClient.post<CitizenProfile>(`${API_PREFIX}/profile`, request)).data;
}

/** A 404 means this signed-in citizen has not created a profile yet. */
export async function getProfile(): Promise<CitizenProfile> {
  return (await apiClient.get<CitizenProfile>(`${API_PREFIX}/profile`)).data;
}

export async function updateProfile(request: ProfileUpdateRequest): Promise<CitizenProfile> {
  return (await apiClient.put<CitizenProfile>(`${API_PREFIX}/profile`, request)).data;
}

export async function listSchemes(params: SchemeListParams = {}): Promise<PaginatedSchemes> {
  return (await apiClient.get<PaginatedSchemes>(`${API_PREFIX}/schemes`, {
    params: { format: "paged", limit: 20, offset: 0, ...params },
  })).data;
}
export const getSchemes = listSchemes;

export async function getScheme(schemeId: string): Promise<SchemeDetail> {
  return (await apiClient.get<SchemeDetail>(`${API_PREFIX}/schemes/${encodeURIComponent(schemeId)}`)).data;
}

export async function checkEligibility(request: EligibilityRequest): Promise<EligibilityResponse> {
  return (await apiClient.post<EligibilityResponse>(`${API_PREFIX}/eligibility/check`, request)).data;
}

export async function getSchemeDocs(schemeId: string): Promise<SchemeDocuments> {
  return (await apiClient.get<SchemeDocuments>(`${API_PREFIX}/schemes/${encodeURIComponent(schemeId)}/documents`)).data;
}
export const getDocuments = getSchemeDocs;

export async function getSchemeTutorial(schemeId: string): Promise<SchemeTutorial> {
  return (await apiClient.get<SchemeTutorial>(`${API_PREFIX}/schemes/${encodeURIComponent(schemeId)}/tutorial`)).data;
}
export const getTutorial = getSchemeTutorial;

/**
 * M2 returns compact deterministic recommendation records. Fetching canonical
 * details here preserves the existing result-card data density without
 * creating client-side ranking or scheme facts.
 */
export async function recommendSchemes(request: RecommendationRequest): Promise<RecommendationResponse> {
  const response = (await apiClient.post<M2RecommendationResponse>(`${API_PREFIX}/schemes/recommend`, request)).data;
  const items = await Promise.all(response.items.map(async (item) => ({
    scheme: await getRecommendationScheme(item.scheme_code, item.name),
    score: item.score,
    match_reasons: item.match_reasons,
  })));
  return { items, total: response.total, disclaimer: response.disclaimer };
}

async function getRecommendationScheme(schemeCode: string, name: string): Promise<SchemeSummary> {
  try { return await getScheme(schemeCode); }
  catch {
    // M2's recommendation payload intentionally provides only code/name.
    // Keep the existing card navigable while the catalogue record is unavailable.
    return { scheme_code: schemeCode, name, description: "", ministry: "", department: "", scheme_type: "", status: "", aliases: [], target_groups: [], tags: [], benefits: "", official_url: "", effective_from: null, effective_to: null, last_verified_at: "" };
  }
}
