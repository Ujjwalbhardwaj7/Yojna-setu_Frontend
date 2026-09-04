import { Link, NavLink, Outlet } from "react-router-dom";
import logoSvg from "@/assets/logo.svg";
import { useAuth } from "@/contexts/AuthContext";
import { useI18n } from "@/i18n";

export default function AppShell() {
  const { state, user, openAuth, signOut } = useAuth();
  const { language, setLanguage, t } = useI18n();
  return <div className="site-shell">
    <header className="border-b border-[#d9d7ca] bg-[#f7f3e9]/95"><div className="container flex min-h-[72px] items-center justify-between gap-4">
      <Link to="/" aria-label={t("homeAria")}><img src={logoSvg} alt={t("logoAlt")} className="h-12 w-[205px] object-contain object-left" /></Link>
      <nav aria-label={t("primaryNavigation")} className="flex flex-wrap items-center justify-end gap-2 text-sm font-bold text-[#52605d] sm:gap-5">
        <NavLink to="/search" className={({isActive}) => isActive ? "nav-active" : "nav-link"}>{t("findScheme")}</NavLink>
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-active" : "nav-link"}>{t("myJourney")}</NavLink>
        <label className="sr-only" htmlFor="site-language">{t("languageLabel")}</label>
        <select id="site-language" className="language-select" value={language} onChange={(event) => setLanguage(event.target.value as "en" | "hi")}>
          <option value="en">{t("english")}</option><option value="hi">{t("hindi")}</option>
        </select>
        {state === "unauthenticated" && <button className="nav-link" onClick={openAuth}>{t("signIn")}</button>}
        {state === "authenticated" && <button className="nav-link" onClick={() => void signOut()} aria-label={t("signOutAria", { email: user?.email ?? "" })}>{t("signOut")}</button>}
      </nav>
    </div></header>
    <Outlet />
    <footer className="mt-12 border-t border-[#d9d7ca] bg-[#082d34] text-[#f1f8dd]"><div className="container flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between"><p>{t("footerBrand")}</p><p className="max-w-xl text-[#dbe3c2]">{t("footerCopy")}</p></div></footer>
  </div>;
}
