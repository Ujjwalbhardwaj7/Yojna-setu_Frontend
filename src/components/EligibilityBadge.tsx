/**
 * YojanaSetu — EligibilityBadge
 *
 * Renders one of three distinct eligibility states returned by the M2
 * deterministic eligibility engine:
 *
 *   "Eligible"             → Green banner  + "Apply now" link to official_url
 *   "Potentially Eligible" → Amber banner  + list of missing_fields to prompt
 *   "Not Eligible"         → Red banner    + breakdown of failed reasons
 *
 * Uses existing CSS design tokens from index.css — no additional classes needed.
 */

import type { EligibilityResponse, EligibilityStatus } from "@/services/api/types";
import { localizeStatus, useI18n } from "@/i18n";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface EligibilityBadgeProps {
  /** The full result object from POST /api/v1/eligibility/check */
  result: EligibilityResponse;
  /** Official portal URL for the scheme (from SchemeDetail.official_url) */
  officialUrl?: string;
  /**
   * Called when the user clicks "Answer missing questions" on a
   * Potentially Eligible result. Passes the list of missing field names.
   */
  onAnswerMissing?: (missingFields: string[]) => void;
  className?: string;
}

// ---------------------------------------------------------------------------
// Config per status
// ---------------------------------------------------------------------------

const STATUS_CONFIG: Record<
  EligibilityStatus,
  {
    borderColor: string;
    bgColor: string;
    textColor: string;
    icon: string;
  }
> = {
  Eligible: {
    borderColor: "#527044",
    bgColor: "#f1f8dd",
    textColor: "#527044",
    icon: "✓",
  },
  "Potentially Eligible": {
    borderColor: "#c6a94e",
    bgColor: "#fffbee",
    textColor: "#876f18",
    icon: "?",
  },
  "Not Eligible": {
    borderColor: "#9e4a46",
    bgColor: "#fff5f4",
    textColor: "#7a2e2b",
    icon: "✕",
  },
};

// ---------------------------------------------------------------------------
// Helper to format a missing_fields key into a readable label
// e.g. "annual_income" → "Annual income"
// ---------------------------------------------------------------------------
function formatFieldName(field: string): string {
  return field
    .replace(/_/g, " ")
    .replace(/\b\w/, (c) => c.toUpperCase());
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function EligibilityBadge({
  result,
  officialUrl,
  onAnswerMissing,
  className = "",
}: EligibilityBadgeProps) {
  const { t } = useI18n();
  const status = result.status;
  const cfg = STATUS_CONFIG[status];

  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      style={{
        borderLeft: `3px solid ${cfg.borderColor}`,
        background: cfg.bgColor,
        padding: "1.1rem 1.25rem",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* ------------------------------------------------------------------ */}
      {/* Status header                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
        <span
          aria-hidden="true"
          style={{
            display: "inline-grid",
            placeItems: "center",
            width: "1.5rem",
            height: "1.5rem",
            border: `1.5px solid ${cfg.borderColor}`,
            color: cfg.textColor,
            fontSize: "0.75rem",
            fontWeight: 700,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </span>
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: cfg.textColor,
          }}
        >
          {localizeStatus(status, t)}
        </span>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Eligible — call-to-action                                            */}
      {/* ------------------------------------------------------------------ */}
      {status === "Eligible" && (
        <div style={{ marginTop: "0.85rem" }}>
          {result.reasons.length > 0 && (
            <ul
              style={{
                margin: "0 0 0.9rem",
                paddingLeft: "1.1rem",
                fontSize: "0.82rem",
                lineHeight: "1.65",
                color: "#52605d",
              }}
            >
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
          {officialUrl && (
            <a
              id={`eligibility-apply-${result.scheme_code}`}
              href={officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                minHeight: "40px",
                padding: "0.55rem 1rem",
                background: "#082d34",
                color: "#f1f8dd",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "background 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#12454a";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = "#082d34";
                (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
              }}
            >
              {t("continueOfficially")}
            </a>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Potentially Eligible — prompt missing fields                         */}
      {/* ------------------------------------------------------------------ */}
      {status === "Potentially Eligible" && (
        <div style={{ marginTop: "0.85rem" }}>
          <p
            style={{
              margin: "0 0 0.65rem",
              fontSize: "0.82rem",
              color: "#52605d",
              lineHeight: 1.6,
            }}
          >
            {t("needsDetails")}
          </p>
          {result.missing_fields.length > 0 && (
            <ul
              style={{
                margin: "0 0 0.9rem",
                paddingLeft: "1.1rem",
                fontSize: "0.82rem",
                lineHeight: "1.65",
                color: "#52605d",
              }}
              aria-label={t("missingInfoAria")}
            >
              {result.missing_fields.map((f) => (
                <li key={f} style={{ color: "#876f18", fontWeight: 600 }}>
                  {formatFieldName(f)}
                </li>
              ))}
            </ul>
          )}
          {onAnswerMissing && result.missing_fields.length > 0 && (
            <button
              id={`eligibility-fill-missing-${result.scheme_code}`}
              onClick={() => onAnswerMissing(result.missing_fields)}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.4rem",
                minHeight: "40px",
                padding: "0.55rem 1rem",
                background: "transparent",
                border: `1.5px solid ${cfg.borderColor}`,
                color: cfg.textColor,
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "background 0.18s",
              }}
            >
              {t("answerMissingQuestions")}
            </button>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Not Eligible — failure reasons                                       */}
      {/* ------------------------------------------------------------------ */}
      {status === "Not Eligible" && (
        <div style={{ marginTop: "0.85rem" }}>
          <p
            style={{
              margin: "0 0 0.65rem",
              fontSize: "0.82rem",
              color: "#52605d",
              lineHeight: 1.6,
            }}
          >
            {t("notEligibleDescription")}
          </p>
          {result.reasons.length > 0 && (
            <ul
              style={{
                margin: 0,
                paddingLeft: "1.1rem",
                fontSize: "0.82rem",
                lineHeight: "1.65",
                color: "#7a2e2b",
              }}
              aria-label={t("ineligibilityAria")}
            >
              {result.reasons.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
