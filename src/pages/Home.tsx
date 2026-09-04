import { Link } from "react-router-dom";
import journeyVisual from "@/assets/journey-visual.png";
import { useI18n } from "@/i18n";
import { ShieldCheck, EyeOff, ExternalLink } from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   Editorial feature strip — fixed content, not translated.
   Content is factual and non-sensitive so hardcoding is fine.
───────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    num: "01",
    title: "Personalized Discovery",
    desc: "Find schemes based on the profile information you provide.",
  },
  {
    num: "02",
    title: "Explainable Eligibility",
    desc: "Understand which requirements PASS, FAIL, or still need information.",
  },
  {
    num: "03",
    title: "Application Ready",
    desc: "Prepare required documents and follow guided application steps.",
  },
] as const;

const TRUST = [
  { Icon: ShieldCheck, label: "Verified Sources" },
  { Icon: EyeOff,      label: "No Aadhaar / OTP Required" },
  { Icon: ExternalLink, label: "Official Portal Handoff" },
] as const;

export default function Home() {
  const { t } = useI18n();

  return (
    <main>
      {/* ── Hero two-column ─────────────────────────────────── */}
      <section
        className="container grid items-center gap-10 py-12 lg:grid-cols-[1fr_1.25fr] lg:pt-16 lg:pb-14"
        aria-label={t("homeEyebrow")}
      >
        {/* LEFT — text stack */}
        <div className="max-w-2xl">
          <p className="rule-label">{t("homeEyebrow")}</p>

          <h1 className="display mt-6 text-[clamp(2.8rem,5vw,5rem)] text-[#082d34]">
            {t("homeTitle")}
          </h1>

          <p className="mt-6 max-w-lg text-lg leading-8 text-[#52605d]">
            {t("homeDescription")}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="btn btn-primary" to="/profile">
              {t("findForMe")} <span aria-hidden="true">→</span>
            </Link>
            <Link className="btn btn-quiet" to="/search">
              {t("findScheme")} <span aria-hidden="true">⌕</span>
            </Link>
          </div>

          <p className="mt-5 text-sm leading-6 text-[#66736f]">
            {t("privacyNotice")}
          </p>
        </div>

        {/* RIGHT — journey illustration */}
        <figure className="journey-image m-0" aria-label={t("journeyFlow")}>
          <img
            src={journeyVisual}
            alt={t("heroImageAlt")}
            className="block w-full h-auto"
            loading="eager"
          />
        </figure>
      </section>

      {/* ── Feature Strip ───────────────────────────────────── */}
      <section
        className="hero-strip"
        aria-label="How YojanaSetu works"
      >
        <div className="container">
          {/* 3-column editorial grid */}
          <div className="hero-strip-grid">
            {FEATURES.map(({ num, title, desc }, i) => (
              <div
                key={num}
                className={`hero-strip-col${i > 0 ? " hero-strip-divider" : ""}`}
              >
                <span className="hero-strip-num">{num}</span>
                <h3 className="hero-strip-title">{title}</h3>
                <p className="hero-strip-desc">{desc}</p>
              </div>
            ))}
          </div>

          {/* Trust row */}
          <div className="hero-trust" role="list" aria-label="Trust signals">
            {TRUST.map(({ Icon, label }, i) => (
              <span key={label} className="hero-trust-group" role="listitem">
                {i > 0 && (
                  <span className="hero-trust-sep" aria-hidden="true">•</span>
                )}
                <span className="hero-trust-item">
                  <Icon size={13} strokeWidth={2.5} aria-hidden="true" />
                  {label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
