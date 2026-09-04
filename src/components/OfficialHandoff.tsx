import { useState } from "react";
import { useI18n } from "@/i18n";
export default function OfficialHandoff({ url, name }: { url: string; name: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();
  return <><button className="btn btn-primary" onClick={() => setOpen(true)}>{t("continueOfficialPortal")} <span aria-hidden="true">↗</span></button>{open && <div className="fixed inset-0 z-50 grid place-items-center bg-[#082d34]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="handoff-title"><div className="w-full max-w-lg border-2 border-[#082d34] bg-[#fffdf7] p-6 shadow-xl"><h2 id="handoff-title" className="font-display text-3xl text-[#082d34]">{t("leavingYojanaSetu")}</h2><p className="mt-4 leading-6 text-[#52605d]">{t("handoffCopy", { name })}</p><p className="mt-3 break-all text-sm text-[#66736f]">{t("officialSource")} {url}</p><div className="mt-6 flex flex-wrap gap-3"><a className="btn btn-primary" href={url} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>{t("continueOfficially")}</a><button className="btn btn-quiet" onClick={() => setOpen(false)}>{t("stayOnYojanaSetu")}</button></div></div></div>}</>;
}
