# Profile Contract

**M2 integration shape:** the frontend submits these fields inside `{ "profile": { … } }` to the authenticated profile endpoints. It intentionally excludes Aadhaar numbers, OTPs, passwords, bank credentials, and other unnecessary sensitive data.

| Field | Frontend label | Type | Required | Example | Notes |
| --- | --- | --- | --- | --- | --- |
| `state` | State | string | Yes | `Maharashtra` | Use the API’s canonical state values when supplied. |
| `age` | Age | number | Yes | `24` | Plain age, no date of birth required. |
| `annual_income` | Annual household income (₹) | number | Yes | `350000` | UI sends a number. |
| `occupation` | Occupation | string | Yes | `Farmer` | Controlled display values can be mapped by API later. |
| `education` | Education | string | Yes | `Undergraduate` | Required for MVP profile completeness; M2 to confirm relevance by scheme. |
| `caste_category` | Category | string | Yes | `OBC` | API field currently uses this name; UI label is “Category”. |

The frontend stores a local draft for convenience and submits the profile to the profile service. It never decides eligibility from these values.
