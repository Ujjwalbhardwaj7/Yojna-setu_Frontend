import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { useI18n } from "@/i18n";

type MicrophoneState = "idle" | "listening" | "unavailable" | "denied";

/** UI-only future M3 voice entry point. It never records or transcribes audio. */
export default function MicrophoneToggle() {
  const { t } = useI18n();
  const available = typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
  const [state, setState] = useState<MicrophoneState>(available ? "idle" : "unavailable");
  const streamRef = useRef<MediaStream | null>(null);
  useEffect(() => () => { streamRef.current?.getTracks().forEach((track) => track.stop()); }, []);
  async function toggle() {
    if (state === "unavailable") return;
    if (state === "listening") { streamRef.current?.getTracks().forEach((track) => track.stop()); streamRef.current = null; setState("idle"); return; }
    try { streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true }); setState("listening"); }
    catch { setState("denied"); }
  }
  const label = state === "listening" ? t("microphoneStop") : state === "denied" ? t("microphoneDenied") : state === "unavailable" ? t("microphoneUnavailable") : t("microphoneUse");
  return <div className="flex items-center gap-2"><button type="button" className="btn btn-quiet min-w-12 px-3" aria-label={label} aria-pressed={state === "listening"} disabled={state === "unavailable"} onClick={() => void toggle()}>{state === "denied" || state === "unavailable" ? <MicOff aria-hidden="true" size={19} strokeWidth={2} /> : <Mic aria-hidden="true" size={19} strokeWidth={2} />}</button>{state === "listening" && <span className="text-xs font-bold text-[#527044]" role="status">{t("listening")}</span>}{state === "denied" && <span className="text-xs font-bold text-[#9e4a46]" role="alert">{t("permissionDenied")}</span>}</div>;
}
