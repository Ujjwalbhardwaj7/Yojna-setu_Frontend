# Member 1 - Member 2 Final Integration Handoff

The frontend is on `feature/frontend-m2-integration` and keeps the existing React/Vite/Tailwind visual experience unchanged. It is now prepared for the finalized M2 contract at `VITE_API_BASE_URL` with the `/api/v1` prefix.

## Completed by Member 1

| Area | Integration state |
| --- | --- |
| Landing, profile, results, detail, documents, tutorial, dashboard | Existing UI preserved; components use the central service layer only. |
| Supabase Auth | Browser client, session loading/refresh, sign-up/sign-in, sign-out, bearer-token attachment, and 401 refresh handling are implemented. |
| Profile persistence | `GET`, `POST`, and `PUT /api/v1/profile` use the authenticated JWT and never send `user_id` or `profile_id`. A 404 is treated as a new profile. |
| Catalogue | `GET /api/v1/schemes?format=paged&limit=20&offset=0` with the finalized filters. |
| Recommendations | `POST /api/v1/schemes/recommend`; M2's compact results are enriched only by canonical `GET /schemes/{code}` calls for the existing cards. |
| Eligibility | `POST /api/v1/eligibility/check`; UI displays M2's `eligible`, `status`, reasons, missing fields and evaluated rules. |
| Documents/tutorial | Existing UIs call the finalized per-scheme endpoints. |
| Reverse search | M3 boundary is isolated. Real M2 mode does not call or invent `/schemes/search`. |
| Microphone | Small UI-only control in the existing search interaction. It requests permission only after a click; it does not record, transcribe, call AI, or send audio. |

## Required environment

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_USE_MOCK_DATA=false
VITE_SUPABASE_URL=<project-url>
VITE_SUPABASE_ANON_KEY=<browser-safe-anon-key>
```

Never place `SUPABASE_JWT_SECRET` in the frontend.

## Final M2 calls expected by the frontend

| Capability | Request |
| --- | --- |
| Current user | `GET /api/v1/auth/me` with `Authorization: Bearer <Supabase access token>` |
| Profile read | `GET /api/v1/profile` with bearer token |
| Profile create | `POST /api/v1/profile` body `{ "profile": { … } }` |
| Profile update | `PUT /api/v1/profile` body `{ "profile": { …partial fields } }` |
| Catalogue | `GET /api/v1/schemes?format=paged&limit=20&offset=0` |
| Detail | `GET /api/v1/schemes/{scheme_code}` |
| Recommendations | `POST /api/v1/schemes/recommend` body `{ "profile": { … }, "limit": 10 }` |
| Eligibility | `POST /api/v1/eligibility/check` body `{ "scheme_code": "…", "profile": { … } }` |
| Documents | `GET /api/v1/schemes/{scheme_code}/documents` |
| Tutorial | `GET /api/v1/schemes/{scheme_code}/tutorial` |

## M2 response details the UI uses

- Catalogue: `{ items, total }`.
- Recommendation: `{ items: [{ scheme_code, name, match_reasons, score }], total, disclaimer? }`.
- Eligibility: `{ eligible, status, reason_codes, reasons, missing_fields, evaluated_rules }`, where `status` is `Eligible`, `Potentially Eligible`, or `Not Eligible`.
- Documents: `document_name`, `document_type`, `is_mandatory`, `description`.
- Tutorial: `step_number`, `title`, `description`, `tips`.
- FastAPI failures: `{ "detail": "…" }`; profile 404 specifically means no profile exists.

## Integration verification still required

The local M2 server was not listening during this frontend task, and Supabase environment variables were not available. Therefore, the production-path contract is compiled but not claimed as live-tested.

When M2 and Supabase are running, verify:

1. Sign up/sign in -> bearer token -> `GET /auth/me`.
2. Profile create, refresh/read, and partial update, with no query `user_id`.
3. Profile -> recommendations -> detail -> all three eligibility states -> documents -> tutorial -> official portal.
4. 401, profile 404, 422, 500, network failure, and no-results states.

The existing mock adapter remains available only through `VITE_USE_MOCK_DATA=true` for UI development.
