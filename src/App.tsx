import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "@/components/ErrorBoundary";
import AppShell from "@/components/AppShell";
import Home from "@/pages/Home";
import Profile from "@/pages/Profile";
import Schemes from "@/pages/Schemes";
import Search from "@/pages/Search";
import SchemeDetail from "@/pages/SchemeDetail";
import Dashboard from "@/pages/Dashboard";
import { AuthProvider } from "@/contexts/AuthContext";
import AuthDialog from "@/components/AuthDialog";
import { useI18n } from "@/i18n";

function NotFound() {
  const { t } = useI18n();
  return <main className="container py-16"><h1 className="display text-5xl text-[#082d34]">{t("pageNotFound")}</h1><a className="btn btn-primary mt-6" href="/">{t("returnHome")}</a></main>;
}

export default function App() {
  return <ErrorBoundary><TooltipProvider><AuthProvider><Toaster/><BrowserRouter><Routes><Route element={<AppShell/>}><Route path="/" element={<Home/>}/><Route path="/profile" element={<Profile/>}/><Route path="/schemes" element={<Schemes/>}/><Route path="/search" element={<Search/>}/><Route path="/schemes/:schemeId" element={<SchemeDetail/>}/><Route path="/dashboard" element={<Dashboard/>}/><Route path="*" element={<NotFound/>}/></Route></Routes></BrowserRouter><AuthDialog/></AuthProvider></TooltipProvider></ErrorBoundary>;
}
