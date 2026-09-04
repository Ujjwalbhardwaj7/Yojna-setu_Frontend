import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { createProfile, getProfile, updateProfile, USE_MOCK } from "@/services/api/service";
import { getErrorStatus } from "@/services/api/client";
import { getLocalProfile, setLocalProfile } from "@/services/storage";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n, type TranslationKey } from "@/i18n";

type FormData = { state: string; age: string; annual_income: string; occupation: string; education: string; caste_category: string };
type FormField = keyof FormData;

const steps: { titleKey: TranslationKey; fields: FormField[] }[] = [
  { titleKey: "basicDetails", fields: ["state", "age"] },
  { titleKey: "economicDetails", fields: ["annual_income", "caste_category"] },
  { titleKey: "educationOccupation", fields: ["occupation", "education"] },
  { titleKey: "reviewProfile", fields: [] },
];

const fieldLabels: Record<FormField, TranslationKey> = {
  state: "state", age: "age", annual_income: "annualIncome", occupation: "occupation", education: "education", caste_category: "category",
};

const options: Record<Exclude<FormField, "age" | "annual_income">, string[]> = {
  state: ["Maharashtra", "Karnataka", "Uttar Pradesh", "West Bengal", "Other"],
  occupation: ["Farmer", "Student", "Salaried", "Self-employed", "Seeking work", "Other"],
  education: ["School", "Diploma", "Undergraduate", "Postgraduate", "Other"],
  caste_category: ["General", "OBC", "SC", "ST", "Prefer not to say"],
};

const optionKeys: Record<string, TranslationKey> = {
  Maharashtra: "maharashtra", Karnataka: "karnataka", "Uttar Pradesh": "uttarPradesh", "West Bengal": "westBengal", Other: "other",
  Farmer: "farmer", Student: "student", Salaried: "salaried", "Self-employed": "selfEmployed", "Seeking work": "seekingWork",
  School: "school", Diploma: "diploma", Undergraduate: "undergraduate", Postgraduate: "postgraduate",
  General: "general", OBC: "obc", SC: "sc", ST: "st", "Prefer not to say": "preferNotToSay",
};

function toFormData(source: ReturnType<typeof getLocalProfile>): FormData {
  return { state: String(source?.state ?? ""), age: source?.age ? String(source.age) : "", annual_income: source?.annual_income ? String(source.annual_income) : "", occupation: String(source?.occupation ?? ""), education: String(source?.education ?? ""), caste_category: String(source?.caste_category ?? "") };
}

export default function Profile() {
  const navigate = useNavigate();
  const auth = useAuth();
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(() => toFormData(getLocalProfile()));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(false);
  const current = steps[step];
  const filled = useMemo(() => current.fields.every((key) => data[key] !== ""), [current, data]);
  const update = (key: FormField, value: string) => setData((old) => ({ ...old, [key]: value }));
  const displayValue = (value: string) => optionKeys[value] ? t(optionKeys[value]) : value;

  useEffect(() => {
    if (!USE_MOCK && auth.state !== "authenticated") return;
    let active = true;
    getProfile().then((remote) => {
      if (!active) return;
      setProfileExists(true);
      const cached = setLocalProfile(remote.profile);
      setData(toFormData(cached));
    }).catch((cause) => {
      if (!active || getErrorStatus(cause) === 404) return;
      setError(t("profileLoadError"));
    });
    return () => { active = false; };
  }, [auth.state, t]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!filled) { setError(t("completeFields")); return; }
    setError("");
    if (step < steps.length - 1) { setStep(step + 1); return; }
    if (!USE_MOCK && auth.state !== "authenticated") {
      setError(auth.state === "loading" ? t("checkingSession") : t("signInToSave"));
      if (auth.state === "unauthenticated") auth.openAuth();
      return;
    }
    const profile = { state: data.state, age: Number(data.age), annual_income: Number(data.annual_income), occupation: data.occupation, education: data.education, caste_category: data.caste_category };
    setSaving(true);
    try {
      const saved = profileExists ? await updateProfile({ profile }) : await createProfile({ profile });
      setLocalProfile(saved.profile);
      setProfileExists(true);
      navigate("/schemes");
    } catch (cause) {
      setError(getErrorStatus(cause) === 401 ? t("profileSaveExpired") : t("profileSaveError"));
    } finally { setSaving(false); }
  }

  return <main className="container max-w-4xl py-14">
    <p className="eyebrow">{t("profileBuilder")}</p>
    <div className="mt-3 flex items-center gap-2" aria-label={t("profileStepAria", { current: step + 1, total: steps.length })}>{steps.map((item, index) => <div key={item.titleKey} className={`h-2 flex-1 ${index <= step ? "bg-[#082d34]" : "bg-[#d9d7ca]"}`} />)}</div>
    <div className="mt-8 grid gap-10 lg:grid-cols-[.8fr_1.2fr]">
      <div><p className="text-sm font-bold text-[#66736f]">{t("profileStep", { current: step + 1, total: steps.length })}</p><h1 className="display mt-4 text-5xl text-[#082d34]">{t(current.titleKey)}</h1><p className="mt-5 leading-7 text-[#52605d]">{t("profileIntro")}</p></div>
      <form onSubmit={submit} className="border-t-2 border-[#082d34] pt-6">
        <div className="grid gap-5">{current.fields.length ? current.fields.map((key) => <label key={key} className="grid gap-2 font-bold text-[#082d34]"><span>{t(fieldLabels[key])}</span>{key in options ? <select value={data[key]} onChange={(event) => update(key, event.target.value)} className="form-control"><option value="">{t("chooseOption")}</option>{options[key as keyof typeof options].map((value) => <option key={value} value={value}>{displayValue(value)}</option>)}</select> : <input required min={key === "age" ? 0 : undefined} inputMode="numeric" value={data[key]} onChange={(event) => update(key, event.target.value)} className="form-control" />}</label>) : <dl className="divide-y divide-[#d9d7ca] border-y border-[#d9d7ca]">{(["state", "age", "annual_income", "occupation", "education", "caste_category"] as FormField[]).map((key) => <div key={key} className="flex justify-between gap-4 py-3"><dt className="font-bold text-[#082d34]">{t(fieldLabels[key])}</dt><dd className="text-right text-[#52605d]">{key === "annual_income" && data[key] ? `₹${data[key]}` : displayValue(data[key])}</dd></div>)}</dl>}</div>
        {error && <p role="alert" className="mt-5 text-sm font-bold text-[#9e4a46]">{error}</p>}
        <div className="mt-8 flex justify-between gap-3">{step ? <button type="button" className="btn btn-quiet" onClick={() => setStep(step - 1)}>{t("back")}</button> : <span /> }<button className="btn btn-primary" disabled={saving}>{step === steps.length - 1 ? (saving ? t("saving") : t("submitProfile")) : t("continue")}</button></div>
      </form>
    </div>
  </main>;
}
