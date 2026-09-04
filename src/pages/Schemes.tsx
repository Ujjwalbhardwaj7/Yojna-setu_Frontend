import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SchemeCard from "@/components/SchemeCard";
import { listSchemes, recommendSchemes, type RecommendedSchemeItem, type SchemeSummary } from "@/services/api/service";
import { getLocalProfile } from "@/services/storage";
import { useI18n } from "@/i18n";

export default function Schemes() {
  const { t } = useI18n();
  const [items, setItems] = useState<RecommendedSchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [term, setTerm] = useState("");
  const profile = getLocalProfile();

  useEffect(() => {
    let live = true;
    if (!profile) { setLoading(false); return; }
    recommendSchemes({ profile, limit: 10 }).then((result) => {
      if (live) setItems(result.items);
    }).catch(() => live && setError(t("recommendationsError"))).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [t]);

  async function browse() {
    setLoading(true);
    setError("");
    try {
      const result = await listSchemes({ search: term });
      setItems(result.items.map((scheme: SchemeSummary) => ({ scheme, score: 0, match_reasons: [] })));
    } catch { setError(t("catalogueError")); }
    finally { setLoading(false); }
  }

  if (!profile) return <main className="container max-w-3xl py-16"><p className="eyebrow">{t("personalizedResults")}</p><h1 className="display mt-4 text-5xl text-[#082d34]">{t("completeProfileFirst")}</h1><p className="mt-5 max-w-xl leading-7 text-[#52605d]">{t("profileRequiredDescription")}</p><Link className="btn btn-primary mt-8" to="/profile">{t("buildProfile")}</Link></main>;
  return <main className="container py-14"><div className="flex flex-col justify-between gap-5 border-b border-[#d9d7ca] pb-8 md:flex-row md:items-end"><div><p className="eyebrow">{t("personalizedResults")}</p><h1 className="display mt-4 text-5xl text-[#082d34]">{t("schemesToExplore")}</h1><p className="mt-4 max-w-xl text-[#52605d]">{t("resultsDescription")}</p></div><Link className="btn btn-quiet" to="/profile">{t("editProfile")}</Link></div><form className="mt-8 flex flex-col gap-3 sm:flex-row" onSubmit={(event) => { event.preventDefault(); void browse(); }}><label className="sr-only" htmlFor="catalogue-search">{t("filterSchemes")}</label><input id="catalogue-search" value={term} onChange={(event) => setTerm(event.target.value)} className="form-control flex-1" placeholder={t("catalogueFilterPlaceholder")}/><button className="btn btn-quiet">{t("filter")}</button></form>{loading ? <p className="mt-12 text-[#52605d]" role="status">{t("loadingSchemeResults")}</p> : error ? <div className="notice-error mt-8" role="alert">{error}<button className="ml-3 underline" onClick={() => void browse()}>{t("tryAgain")}</button></div> : items.length === 0 ? <div className="mt-10 border-l-2 border-[#7c9469] bg-[#f1f8dd] p-6"><h2 className="font-display text-2xl text-[#082d34]">{t("noSchemesMatched")}</h2><p className="mt-2 text-[#52605d]">{t("noSchemesMatchedDescription")}</p><Link className="mt-4 inline-block font-bold text-[#082d34] underline" to="/search">{t("findScheme")}</Link></div> : <div className="mt-7 space-y-4">{items.map((item, index) => <SchemeCard key={item.scheme.scheme_code} scheme={item.scheme} rank={index + 1} score={item.score || undefined} reason={item.match_reasons[0]} />)}</div>}</main>;
}
