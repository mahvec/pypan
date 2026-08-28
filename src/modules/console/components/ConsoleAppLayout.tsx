import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery } from "convex/react";
import { FileUp, House, LayoutDashboard, List, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { NavLink, Navigate, Outlet, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Button } from "@/shared/ui/Button";

const SESSION_KEY = "pypan-console-session";
const NAV_ITEMS = [{ label: "Overview", to: "/console/dashboard", icon: LayoutDashboard }, { label: "Houses", to: "/console/houses", icon: House }, { label: "Roster upload", to: "/console/upload", icon: FileUp }, { label: "Roster", to: "/console/roster", icon: List }];

export function ConsoleAppLayout() {
  const [token] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [isOpen, setIsOpen] = useState(false);
  const isSessionValid = useQuery(api.auth.validateSession, token ? { token } : "skip");
  const logout = useMutation(api.auth.logout);
  const navigate = useNavigate();
  if (!token || isSessionValid === false) return <Navigate replace to="/console" />;
  if (isSessionValid === undefined) return <main className="flex min-h-[100dvh] items-center justify-center bg-paper"><p className="text-muted">Checking your Console session...</p></main>;
  const handleLogout = async () => { await logout({ token }); sessionStorage.removeItem(SESSION_KEY); toast.success("You have signed out."); navigate("/console"); };
  return <main className="min-h-[100dvh] bg-paper md:grid md:grid-cols-[15rem_1fr]"><aside className="hidden border-r border-line bg-white p-5 md:block"><Sidebar onNavigate={() => undefined} /></aside><div className="min-w-0"><header className="sticky top-0 z-20 flex items-center justify-between border-b border-line bg-white px-5 py-4"><div className="flex items-center gap-3"><Button aria-label="Open Console navigation" className="md:hidden" variant="text" onClick={() => setIsOpen(true)}><Menu size={20} /></Button><div><p className="m-0 text-sm font-bold">PYPAN Planning Console</p><p className="m-0 text-xs text-muted">Inter-House Sports Day</p></div></div><Button variant="text" onClick={() => void handleLogout()}><LogOut size={18} />Sign out</Button></header><section><Outlet /></section></div><AnimatePresence>{isOpen ? <><motion.button aria-label="Close Console navigation" className="fixed inset-0 z-30 bg-ink/35 md:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} /><motion.aside className="fixed inset-y-0 left-0 z-40 w-72 border-r border-line bg-white p-5 md:hidden" initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 28, stiffness: 280 }}><div className="mb-8 flex items-center justify-between"><BrandMark /><Button aria-label="Close Console navigation" variant="text" onClick={() => setIsOpen(false)}><X size={20} /></Button></div><Sidebar onNavigate={() => setIsOpen(false)} /></motion.aside></> : null}</AnimatePresence></main>;
}

function Sidebar({ onNavigate }: { onNavigate: () => void }) { return <><BrandMark /><nav className="mt-10 grid gap-1">{NAV_ITEMS.map(({ icon: Icon, label, to }) => <NavLink className={({ isActive }) => `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-bold transition ${isActive ? "bg-ink text-white" : "text-muted hover:bg-paper hover:text-ink"}`} key={to} to={to} onClick={onNavigate}><Icon size={18} />{label}</NavLink>)}</nav><p className="mt-10 border-t border-line pt-5 text-xs leading-relaxed text-muted">PYPAN House Reveal<br />Planning Console</p></>; }
