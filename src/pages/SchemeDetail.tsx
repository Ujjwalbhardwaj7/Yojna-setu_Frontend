import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import OfficialHandoff from "@/components/OfficialHandoff";
import { StatusPill } from "@/components/SchemeCard";
import { checkEligibility, getScheme, getSchemeDocs, getSchemeTutorial, type EligibilityResponse, type SchemeDetail as Scheme, type SchemeDocuments, type SchemeTutorial } from "@/services/api/service";
import { getLocalProfile, getReadyDocuments, getSavedSchemes, toggleReadyDocument, toggleSavedScheme } from "@/services/storage";
import { localizeStatus, useI18n } from "@/i18n";
import { translateContent } from "@/i18n/content";

export default function SchemeDetail() {
  const { schemeId = "" } = useParams();
  const navigate = useNavigate();
  const { language, t } = useI18n();
  const [scheme, setScheme] = useState<Scheme | null>(null);
  const [eligibility, setEligibility] = useState<EligibilityResponse | null>(null);
  const [documents, setDocuments] = useState<SchemeDocuments | null>(null);
  const [tutorial, setTutorial] = useState<SchemeTutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [ready, setReady] = useState<Set<string>>(new Set());

  useEffect(() => {
    let live = true;
    setLoading(true);
    Promise.all([getScheme(schemeId), getSchemeDocs(schemeId), getSchemeTutorial(schemeId)]).then(async ([loadedScheme, docs, guide]) => {
      if (!live) return;
      setScheme(loadedScheme); setDocuments(docs); setTutorial(guide);
      setSaved(getSavedSchemes().has(loadedScheme.scheme_code));
      setReady(getReadyDocuments(loadedScheme.scheme_code));
      const profile = getLocalProfile();
      if (profile) {
        try {
          const result = await checkEligibility({ scheme_code: loadedScheme.scheme_code, profile });
          if (live) setEligibility(result);
        } catch { /* Detail remains useful when an eligibility response is unavailable. */ }
      }
    }).catch(() => live && setError(t("schemeLoadError"))).finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [schemeId, t]);

  if (loading) return <main className="container py-16" role="status">{t("loadingSchemeDetails")}</main>;
  if (error || !scheme) return <main className="container py-16"><div className="notice-error" role="alert">{error || t("schemeUnavailable")}</div><Link className="btn btn-quiet mt-6" to="/schemes">{t("backToSchemes")}</Link></main>;

  const documentList = Array.isArray(documents) ? documents : documents?.documents ?? [];
  const mandatory = documentList.filter((item) => item.is_mandatory) ?? [];
  const readyMandatory = mandatory.filter((item) => ready.has(item.document_name)).length;
  const current = tutorial?.steps[step];
  const date = new Date(scheme.last_verified_at).toLocaleDateString(language === "hi" ? "hi-IN" : "en-IN");
  const content = (value: string) => translateContent(value, language);
  function toggleSaved() { const schemeCode = scheme!.scheme_code; setSaved(toggleSavedScheme(schemeCode).has(schemeCode)); }
  function toggleDocument(name: string) { setReady(new Set(toggleReadyDocument(scheme!.scheme_code, name))); }

  return <main className="container py-12">
    <Link className="text-sm font-bold text-[#52605d] hover:text-[#082d34]" to="/schemes">{t("backToSchemes")}</Link>
    <div className="mt-10 grid gap-12 lg:grid-cols-[.88fr_1.12fr]">
      <section>
        <p className="eyebrow">{t("schemeType", { type: content(scheme.scheme_type), status: localizeStatus(scheme.status, t) })}</p>
        <h1 className="display mt-4 text-5xl text-[#082d34]">{scheme.name}</h1><p className="mt-6 text-lg leading-8 text-[#52605d]">{content(scheme.description)}</p>
        <div className="mt-7 flex flex-wrap gap-3"><OfficialHandoff url={scheme.official_url} name={scheme.name}/><button className="btn btn-quiet" aria-pressed={saved} onClick={toggleSaved}>{saved ? t("saved") : t("saveScheme")}</button></div>
        <aside className="mt-8 border-l-2 border-[#7c9469] bg-[#f1f8dd] p-5 text-sm leading-6 text-[#52605d]"><strong className="text-[#082d34]">{t("explanationLabel")}</strong> {t("explanationCopy")} <strong className="text-[#082d34]">{t("officialSource")}</strong> {content(scheme.ministry)}; {t("lastVerified", { date })} {t("verificationStatus", { status: localizeStatus(scheme.status, t) })}</aside>
      </section>
      <section className="space-y-8">
        <Info title={t("benefits")}><p>{content(scheme.benefits)}</p><p className="mt-3 text-sm text-[#66736f]">{t("targetUsers")} {scheme.target_groups.map(content).join(", ")}</p><p className="mt-2 text-sm text-[#66736f]">{t("department")} {content(scheme.department)}</p></Info>
        <EligibilityPanel eligibility={eligibility} onComplete={() => navigate("/profile")} />
        <Info title={t("documentsProgress", { ready: readyMandatory, total: mandatory.length })}><p className="mb-4 text-sm text-[#52605d]">{t("documentChecklistCopy")}</p><ul className="space-y-3">{documentList.map((document) => <li key={document.document_name} className="border-t border-[#d9d7ca] pt-3"><label className="flex cursor-pointer items-start gap-3"><input className="mt-1 h-4 w-4 accent-[#082d34]" type="checkbox" checked={ready.has(document.document_name)} onChange={() => toggleDocument(document.document_name)}/><span><strong className="text-[#082d34]">{content(document.document_name)}</strong> <span className="text-sm text-[#66736f]">({document.is_mandatory ? t("required") : t("optional")})</span><span className="mt-1 block text-sm leading-5 text-[#52605d]">{content(document.description)} {t("documentSourceCopy")}</span></span></label></li>)}</ul></Info>
      </section>
    </div>
    <section className="mt-12 border-t-2 border-[#082d34] pt-6"><p className="eyebrow">{t("guidedTutorial")}</p><h2 className="font-display mt-3 text-3xl text-[#082d34]">{t("prepareOfficialApplication")}</h2>{current ? <div className="mt-6 grid gap-5 bg-[#f1f8dd] p-6 md:grid-cols-[150px_auto_1fr]"><div aria-label={t("officialPortalScreen")} className="grid min-h-28 place-items-center border-2 border-[#082d34] bg-[#fffdf7] p-3 text-center text-xs font-bold text-[#52605d]"><span className="block border-b-2 border-[#082d34] pb-2 text-[#082d34]">{t("officialPortal")}</span><span className="mt-3 block">{t("illustrativeScreen")}</span></div><div className="grid h-14 w-14 place-items-center bg-[#082d34] font-display text-2xl text-[#f1f8dd]">{current.step_number}</div><div><p className="eyebrow">{t("tutorialStep", { current: step + 1, total: tutorial?.steps.length })}</p><h3 className="mt-2 font-display text-2xl text-[#082d34]">{content(current.title)}</h3><p className="mt-3 leading-6 text-[#52605d]">{content(current.description)}</p><p className="mt-3 border-l-2 border-[#7c9469] pl-3 text-sm text-[#52605d]"><strong>{t("helpfulNote")}</strong> {content(current.tips)}</p>{current.warning && <p className="mt-3 text-sm font-bold text-[#876f18]">{t("warning")} {content(current.warning)}</p>}<div className="mt-6 flex gap-3"><button className="btn btn-quiet" disabled={step === 0} onClick={() => setStep(step - 1)}>{t("previous")}</button><button className="btn btn-primary" disabled={step === (tutorial?.steps.length ?? 1) - 1} onClick={() => setStep(step + 1)}>{t("next")}</button></div></div></div> : <p className="mt-4 text-[#52605d]">{t("noTutorial")}</p>}</section>
  </main>;
}

function Info({ title, children }: { title: string; children: ReactNode }) { return <section className="border-t-2 border-[#082d34] pt-4"><h2 className="font-display text-2xl text-[#082d34]">{title}</h2><div className="mt-4 leading-6 text-[#52605d]">{children}</div></section>; }

function EligibilityPanel({ eligibility, onComplete }: { eligibility: EligibilityResponse | null; onComplete: () => void }) {
  const { language, t } = useI18n();
  const content = (value: string) => translateContent(value, language);
  if (!eligibility) return <Info title={t("eligibilityResult")}><p>{t("completeProfileForEligibility")}</p><button className="btn btn-quiet mt-4" onClick={onComplete}>{t("completeProfile")}</button></Info>;
  return <Info title={t("eligibilityResult")}><StatusPill status={eligibility.status}/><p className="mt-4">{content(eligibility.reasons[0] ?? t("serviceReturnedEligibility"))}</p><ul className="mt-4 space-y-3">{eligibility.evaluated_rules.map((rule) => <li key={`${rule.field}-${rule.description}`} className="border-l-2 border-[#7c9469] bg-[#f1f8dd] p-3 text-sm"><strong>{rule.passed ? t("pass") : eligibility.missing_fields.includes(rule.field) ? t("missing") : t("fail")} — {content(rule.field)}</strong><span className="mt-1 block">{t("requiredValue")} {content(rule.expected)}</span><span className="block">{t("yourValue")} {content(rule.actual)}</span><span className="block text-[#52605d]">{content(rule.description)}</span></li>)}</ul>{eligibility.missing_fields.length > 0 && <button className="btn btn-quiet mt-4" onClick={onComplete}>{t("addMissingDetails")}</button>}</Info>;
}
