import { Link } from "react-router-dom";
import type { EligibilityStatus, SchemeSummary } from "@/services/api/service";
import { localizeStatus, useI18n } from "@/i18n";
import { translateContent } from "@/i18n/content";

const statusStyle: Record<EligibilityStatus | "More Information Required", string> = {
  Eligible: "status-pass", "Potentially Eligible": "status-potential", "Not Eligible": "status-fail", "More Information Required": "status-potential",
};
export function StatusPill({ status }: { status: EligibilityStatus | "More Information Required" }) {
  const { t } = useI18n();
  return <span className={statusStyle[status]}><span aria-hidden="true">{status === "Eligible" ? "✓" : status === "Not Eligible" ? "!" : "?"}</span> {localizeStatus(status, t)}</span>;
}
export default function SchemeCard({ scheme, rank, status, reason, score }: { scheme: SchemeSummary; rank?: number; status?: EligibilityStatus | "More Information Required"; reason?: string; score?: number }) {
  const { language, t } = useI18n();
  const content = (value: string) => translateContent(value, language);
  return <article className="scheme-card">
    {rank && <span className="font-display text-3xl text-[#7c9469]">0{rank}</span>}
    <div><div className="eyebrow">{content(scheme.scheme_type)} · {content(scheme.tags[0] ?? t("schemeFallbackTag"))}</div><h2 className="mt-2 font-display text-2xl text-[#082d34]">{scheme.name}</h2><p className="mt-2 leading-6 text-[#52605d]">{content(scheme.description)}</p><p className="mt-3 text-sm font-semibold text-[#082d34]">{content(scheme.benefits)}</p><p className="mt-2 text-sm text-[#66736f]">{content(scheme.ministry)}</p>{reason && <p className="mt-3 border-l-2 border-[#7c9469] pl-3 text-sm text-[#52605d]">{content(reason)}</p>}</div>
    <div className="flex flex-col items-start gap-4"><>{status && <StatusPill status={status} />}{score !== undefined && <span className="text-xs font-bold text-[#66736f]">{t("matchPercentage", { score: Math.round(score * 100) })}</span>}</><Link className="btn btn-quiet" to={`/schemes/${encodeURIComponent(scheme.scheme_code)}`}>{t("viewDetails")} <span aria-hidden="true">→</span></Link></div>
  </article>;
}
