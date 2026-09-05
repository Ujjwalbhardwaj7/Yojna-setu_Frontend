import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, MicOff } from "lucide-react";
import { useI18n } from "@/i18n";
import { getTranscriptionConfig, transcribeAudio } from "@/services/api/service";

type MicrophoneState = "idle" | "listening" | "processing" | "unavailable" | "denied" | "failed";

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  length: number;
  [index: number]: { transcript: string };
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: SpeechRecognitionResultLike[] }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}
function WebSpeechAPI(): (new () => SpeechRecognitionLike) | null {
  const globalWindow = window as unknown as {
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
    SpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return globalWindow.webkitSpeechRecognition ?? globalWindow.SpeechRecognition ?? null;
}

/** Voice entry point: server-side STT via backend when configured, else the browser Web Speech API. */
export default function MicrophoneToggle({ onTranscribed }: { onTranscribed: (text: string) => void }) {
  const { t } = useI18n();
  const [mode, setMode] = useState<"server" | "web" | null>(null);
  const [state, setState] = useState<MicrophoneState>("idle");
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const finalTextRef = useRef("");

  function stopStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
  function stopRecognition() {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
  }

  useEffect(() => {
    const SpeechRecognition = WebSpeechAPI();
    let cancelled = false;
    (async () => {
      try {
        const config = await getTranscriptionConfig();
        if (cancelled) return;
        if (config.server_stt_configured) setMode("server");
        else if (SpeechRecognition) setMode("web");
        else setState("unavailable");
      } catch {
        if (!cancelled) {
          if (SpeechRecognition) setMode("web");
          else setState("unavailable");
        }
      }
    })();
    return () => {
      cancelled = true;
      stopRecognition();
      stopStream();
    };
  }, []);

  async function transcribeRecordedBlob(blob: Blob) {
    setState("processing");
    try {
      const response = await transcribeAudio(blob);
      if (response.text.trim()) onTranscribed(response.text.trim());
      else setState("failed");
    } catch {
      setState("failed");
    } finally {
      stopStream();
      setState((current) => (current === "processing" ? "idle" : current));
    }
  }

  function handleRecordedChunks() {
    const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || "audio/webm" });
    chunksRef.current = [];
    if (blob.size > 0) void transcribeRecordedBlob(blob);
    else setState("failed");
  }

  function startServer() {
    chunksRef.current = [];
    const recorder = new MediaRecorder(streamRef.current!);
    recorder.ondataavailable = (event) => { if (event.data.size > 0) chunksRef.current.push(event.data); };
    recorder.onstop = handleRecordedChunks;
    recorder.onerror = () => setState("failed");
    recorderRef.current = recorder;
    recorder.start();
    setState("listening");
  }

  function startWeb() {
    const Recognition = WebSpeechAPI();
    if (!Recognition) { setState("unavailable"); return; }
    finalTextRef.current = "";
    const recognition = new Recognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        if (result.isFinal) finalTextRef.current = result[0].transcript;
      }
    };
    recognition.onerror = (event) => setState(event.error === "not-allowed" || event.error === "service-not-allowed" ? "denied" : "failed");
    recognition.onend = () => {
      recognitionRef.current = null;
      const text = finalTextRef.current.trim();
      finalTextRef.current = "";
      setState("idle");
      if (text) onTranscribed(text);
    };
    recognitionRef.current = recognition;
    try { recognition.start(); setState("listening"); }
    catch { setState("denied"); }
  }

  async function toggle() {
    if (state === "unavailable" || state === "processing" || !mode) return;
    if (state === "listening") {
      if (mode === "server") { recorderRef.current?.stop(); stopStream(); }
      else stopRecognition();
      return;
    }
    if (mode === "web") { startWeb(); return; }
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      startServer();
    } catch {
      setState("denied");
    }
  }

  const label =
    state === "listening" ? t("microphoneStop")
    : state === "processing" ? t("processing")
    : state === "denied" ? t("microphoneDenied")
    : state === "failed" ? t("voiceFailed")
    : state === "unavailable" ? t("microphoneUnavailable")
    : t("microphoneUse");
  return <div className="flex items-center gap-2">
    <button type="button" className="btn btn-quiet min-w-12 px-3" aria-label={label} aria-pressed={state === "listening"} disabled={state === "unavailable" || state === "processing"} onClick={() => void toggle()}>
      {state === "processing" ? <Loader2 className="animate-spin" aria-hidden="true" size={19} strokeWidth={2} /> : state === "denied" || state === "unavailable" || state === "failed" ? <MicOff aria-hidden="true" size={19} strokeWidth={2} /> : <Mic aria-hidden="true" size={19} strokeWidth={2} />}
    </button>
    {state === "listening" && <span className="text-xs font-bold text-[#527044]" role="status">{t("listening")}</span>}
    {state === "processing" && <span className="text-xs font-bold text-[#527044]" role="status">{t("processing")}</span>}
    {state === "denied" && <span className="text-xs font-bold text-[#9e4a46]" role="alert">{t("permissionDenied")}</span>}
    {state === "failed" && <span className="text-xs font-bold text-[#9e4a46]" role="alert">{t("voiceFailed")}</span>}
  </div>;
}
