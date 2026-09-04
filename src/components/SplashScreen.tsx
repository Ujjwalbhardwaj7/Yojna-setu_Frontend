/* YojanaSetu / Startup identity: make the official Setu mark the first calm visual, then hand off quickly to the citizen journey. */
import { useEffect, useState } from "react";
import logoSvg from "@/assets/logo.svg";

export default function SplashScreen({ onComplete, duration = 1250 }: { onComplete: () => void; duration?: number }) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener?.("change", update);
    const timer = window.setTimeout(onComplete, media.matches ? 420 : duration);
    return () => { window.clearTimeout(timer); media.removeEventListener?.("change", update); };
  }, [duration, onComplete]);

  return <main className={`splash-screen ${reducedMotion ? "splash-reduced" : ""}`} aria-label="YojanaSetu — From Eligibility to Application" aria-live="polite">
    <div className="splash-lockup">
      <img className="splash-full-logo" src={logoSvg} alt="YojanaSetu — From Eligibility to Application" />
    </div>
  </main>;
}
