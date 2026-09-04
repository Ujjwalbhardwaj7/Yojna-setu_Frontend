/** Development-only adapter. It intentionally contains response fixtures, not eligibility rules. */
import type {
  AuthenticatedUser, CitizenProfile, EligibilityRequest, PaginatedSchemes,
  ProfileCreateRequest, ProfileUpdateRequest, RecommendationRequest, SchemeListParams,
} from "./types";
import { mockDocuments, mockEligibility, mockRecommendations, mockSchemes, mockSearch, mockTutorials } from "@/mocks/schemes";

const delay = (ms = 180) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));
let profile: CitizenProfile | null = null;

export async function healthCheck() { await delay(50); return { status: "healthy", app: "YojanaSetu mock adapter", environment: "development" }; }
export async function getCurrentUser(): Promise<AuthenticatedUser> { await delay(40); return { id: "mock-user", email: "demo@example.test" }; }
export async function createProfile(request: ProfileCreateRequest): Promise<CitizenProfile> { await delay(); profile = { profile: request.profile, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }; return profile; }
export async function getProfile(): Promise<CitizenProfile> { await delay(); if (!profile) { const error = new Error("Profile not found") as Error & { status?: number }; error.status = 404; throw error; } return profile; }
export async function updateProfile(request: ProfileUpdateRequest): Promise<CitizenProfile> { await delay(); profile = { profile: { ...profile?.profile, ...request.profile }, created_at: profile?.created_at ?? new Date().toISOString(), updated_at: new Date().toISOString() }; return profile; }
export async function listSchemes(params: SchemeListParams = {}): Promise<PaginatedSchemes> { await delay(); const term = params.search?.toLowerCase().trim(); const items = term ? mockSchemes.filter((scheme) => [scheme.name, scheme.description, ...scheme.tags].join(" ").toLowerCase().includes(term)) : mockSchemes; return { items, total: items.length }; }
export const getSchemes = listSchemes;
export async function getScheme(schemeId: string) { await delay(); const scheme = mockSchemes.find((item) => item.scheme_code === schemeId || item.aliases.includes(schemeId.toLowerCase())); if (!scheme) throw new Error("Scheme not found"); return scheme; }
export async function checkEligibility(request: EligibilityRequest) { await delay(); return mockEligibility[request.scheme_code] ?? mockEligibility["PM-JAY"]; }
export async function getSchemeDocs(schemeId: string) { await delay(); return mockDocuments[schemeId] ?? { scheme_code: schemeId, documents: [] }; }
export const getDocuments = getSchemeDocs;
export async function getSchemeTutorial(schemeId: string) { await delay(); return mockTutorials[schemeId] ?? { scheme_code: schemeId, steps: [] }; }
export const getTutorial = getSchemeTutorial;
export async function recommendSchemes(_request: RecommendationRequest) { await delay(); return mockRecommendations; }
export async function searchSchemes(_query: string) { await delay(); return mockSearch; }
