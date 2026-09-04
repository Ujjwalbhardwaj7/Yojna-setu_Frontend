# API Contract Required

**Status update (M2 finalized):** Member 2's final JWT-authenticated contract is implemented in the frontend; see [MEMBER_1_BACKEND_HANDOFF.md](MEMBER_1_BACKEND_HANDOFF.md) for the active routes and payloads. The M3 search and Member 4 content details below remain proposed until those owners confirm them.

## Historical Member 2 checklist

1. `POST /profile`: payload, user identity method, create/replace semantics, response.
2. `GET /profile`: identity parameter/auth requirements, not-found response.
3. `PUT /profile`: partial-update semantics and response.
4. `GET /schemes`: item fields, filters, sorting, pagination, and no-match representation.
5. `GET /schemes/{id}`: complete scheme detail, purpose, target users, source metadata, stale state.
6. `POST /eligibility/check`: profile snapshot payload and scheme identifier.
7. Eligibility response: `Eligible`, `Potentially Eligible`, `Not Eligible`, plus reasons and missing fields.
8. Rule explanation: each rule needs name, PASS/FAIL/MISSING status, required condition, user value (where safe), and human-readable reason.
9. `POST /schemes/recommend`: ranking/match-reason response and whether a per-card eligibility status is returned.
10. `GET /schemes/{id}/documents`: mandatory flag, description, issuing/obtaining help, optional status.
11. `GET /schemes/{id}/tutorial`: ordered steps, title, instruction, tips, warning, official action/link, optional image URL and image naming/versioning convention.
12. Error body, error codes, retriable state, pagination, empty state, authentication, and stale-scheme response/state.

Required frontend states: missing profile data, no scheme match, stale scheme, backend unavailable, and AI unavailable.

## Member 3 — search/AI boundary

Confirm `POST /schemes/search` request (`query`, optional context) and response:

```ts
{ results: [{ scheme, confidence: number, match_reason: string }], clarifying_question?: string | null }
```

Clarify confidence range/meaning, multiple-candidate behaviour, no-match and AI-unavailable errors. The frontend does not implement embeddings, ranking, intent extraction, vector search, or LLM logic.

## Member 4 — source content and guides

Confirm scheme source provenance, verification status vocabulary, last-verified dates, official URLs, document help copy, tutorial media assets, and guide content ownership. WhatsApp integration is out of the frontend MVP scope until a contract is supplied.
