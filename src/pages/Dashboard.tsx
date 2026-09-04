import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSchemes, type SchemeSummary } from "@/services/api/service";
import { getLocalProfile, getSavedSchemes } from "@/services/storage";
import { useI18n } from "@/i18n";

export default function Dashboard() {
  const { t } = useI18n();
  const profile = getLocalProfile();
  const savedCodes = getSavedSchemes();
  const [savedSchemes, setSavedSchemes] = useState<SchemeSummary[]>([]);
  const completion = profile ? [profile.state, profile.age, profile.annual_income, profile.occupation, profile.education, profile.caste_category].filter(Boolean).length : 0;
  useEffect(() => {
    if (!savedCodes.size) return;
    let live = true;
    listSchemes({ limit: 20, offset: 0 }).then((response) => { if (live) setSavedSchemes(response.items.filter((scheme) => savedCodes.has(scheme.scheme_code))); }).catch(() => { if (live) setSavedSchemes([]); });
    return () => { live = false; };
  }, []);
  return <main className="container py-14"><p className="eyebrow">{t("myJourney")}</p><h1 className="display mt-4 text-5xl text-[#082d34]">{t("myJourney")}</h1><div className="mt-10 grid gap-5 md:grid-cols-3"><Panel label={t("profileCompletion")} value={t("profileCompletionValue", { count: completion })} action={profile ? t("reviewProfile") : t("completeProfile")} to="/profile"/><Panel label={t("recommendedSchemes")} value={profile ? t("readyToExplore") : t("profileNeeded")} action={t("viewResults")} to="/schemes"/><Panel label={t("documentReadiness")} value={t("trackedPerScheme")} action={t("openSavedSchemes")} to="/schemes"/></div><div className="mt-10 grid gap-8 lg:grid-cols-2"><section className="border-t-2 border-[#082d34] pt-5"><h2 className="font-display text-2xl text-[#082d34]">{t("savedSchemes")}</h2>{savedSchemes.length ? <ul className="mt-4 space-y-3">{savedSchemes.map((scheme) => <li key={scheme.scheme_code} className="border-b border-[#d9d7ca] pb-3"><Link className="font-bold text-[#082d34] underline" to={`/schemes/${scheme.scheme_code}`}>{scheme.name}</Link></li>)}</ul> : <p className="mt-3 text-[#52605d]">{t("noSavedSchemes")}</p>}</section><section className="bg-[#f1f8dd] p-6"><h2 className="font-display text-2xl text-[#082d34]">{t("recentActivity")}</h2><p className="mt-4 text-[#52605d]">{t("recentActivityCopy")}</p><Link className="btn btn-quiet mt-5" to="/search">{t("findScheme")}</Link></section></div></main>;
}
function Panel({ label, value, action, to }: { label: string; value: string; action: string; to: string }) { return <section className="border border-[#d9d7ca] bg-[#fffdf7] p-5"><p className="eyebrow">{label}</p><p className="mt-4 font-display text-3xl text-[#082d34]">{value}</p><Link className="mt-5 inline-block text-sm font-bold text-[#082d34] underline" to={to}>{action} →</Link></section>; }
