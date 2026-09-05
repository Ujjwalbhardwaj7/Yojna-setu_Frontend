/** Single component-facing service surface. Real M2 is the default adapter. */
import * as mock from "./mock";
import * as api from "./index";

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK_DATA as string | undefined) === "true";
const adapter = USE_MOCK ? mock : api;

export const healthCheck = adapter.healthCheck;
export const getCurrentUser = adapter.getCurrentUser;
export const createProfile = adapter.createProfile;
export const getProfile = adapter.getProfile;
export const updateProfile = adapter.updateProfile;
export const listSchemes = adapter.listSchemes;
export const getSchemes = adapter.getSchemes;
export const getScheme = adapter.getScheme;
export const checkEligibility = adapter.checkEligibility;
export const getSchemeDocs = adapter.getSchemeDocs;
export const getDocuments = adapter.getDocuments;
export const getSchemeTutorial = adapter.getSchemeTutorial;
export const getTutorial = adapter.getTutorial;
export const recommendSchemes = adapter.recommendSchemes;
export const searchSchemes = adapter.searchSchemes;
export const getTranscriptionConfig = adapter.getTranscriptionConfig;
export const transcribeAudio = adapter.transcribeAudio;

export type {
  ApiError, AuthenticatedUser, CitizenProfile, DocumentItem, EligibilityProfileSnapshot,
  EligibilityRequest, EligibilityResponse, EligibilityStatus, EvaluatedRule, HealthResponse,
  M2RecommendationItem, M2RecommendationResponse, PaginatedSchemes, ProfileCreateRequest,
  ProfileData, ProfileUpdateRequest, RecommendationRequest, RecommendationResponse,
  RecommendedSchemeItem, SchemeDetail, SchemeDocuments, SchemeListParams, SchemeSearchResponse,
  SchemeSearchResult, SchemeSummary, SchemeTutorial, TutorialStep,
} from "./types";
export { M3SearchUnavailableError } from "./types";
