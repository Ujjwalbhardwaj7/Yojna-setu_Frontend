import { useState, type FormEvent } from "react";
import SchemeCard from "@/components/SchemeCard";
import { searchSchemes, type SchemeSearchResponse, M3SearchUnavailableError } from "@/services/api/service";
import MicrophoneToggle from "@/components/MicrophoneToggle";
import { useI18n } from "@/i18n";
import { translateContent } from "@/i18n/content";

export default function Search() {
  const { language, t } = useI18n();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<SchemeSearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function runSearch(text: string) {
    if (!text.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try { setResult(await searchSchemes(text)); }
    catch (cause) { setError(cause instanceof M3SearchUnavailableError ? t("semanticSearchPending") : t("searchUnavailable")); }
    finally { setLoading(false); }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    await runSearch(query);
  }
  function handleTranscribed(text: string) {
    setQuery(text);
    void runSearch(text);
  }
  return <main className="container max-w-5xl py-14"><p className="rule-label">{t("reverseSchemeSearch")}</p><h1 className="display mt-6 max-w-3xl text-5xl text-[#082d34]">{t("describeNeed")}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-[#52605d]">{t("searchDescription")}</p><form onSubmit={submit} className="mt-9 flex flex-col gap-3 sm:flex-row"><label className="sr-only" htmlFor="scheme-query">{t("describeBenefitAria")}</label><input id="scheme-query" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="form-control min-h-[58px] flex-1" placeholder={t("searchPlaceholder")}/><MicrophoneToggle onTranscribed={handleTranscribed} /><button className="btn btn-primary" disabled={loading}>{loading ? t("searching") : t("search")}</button></form>{error && <div className="notice-error mt-8" role="alert">{error}</div>}{loading && <p className="mt-10 text-[#52605d]" role="status">{t("lookingForMatches")}</p>}{result && <section className="mt-10"><div className="border-l-2 border-[#7c9469] bg-[#f1f8dd] p-5"><p className="eyebrow">{t("searchServiceGuidance")}</p><p className="mt-2 font-semibold text-[#082d34]">{result.clarifying_question ? translateContent(result.clarifying_question, language) : t("chooseBestResult")}</p></div>{result.results.length ? <div className="mt-5 space-y-4">{result.results.map((item) => <SchemeCard key={item.scheme.scheme_code} scheme={item.scheme} score={item.confidence} reason={item.match_reason} />)}</div> : <div className="mt-6 notice-error">{t("noSearchMatches")}</div>}</section>}</main>;
}
