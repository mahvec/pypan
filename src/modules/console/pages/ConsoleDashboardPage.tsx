import { ArrowRight, FileUp, House, List } from "lucide-react";
import { Link } from "react-router-dom";

const DASHBOARD_ACTIONS = [{ label: "Set up houses", detail: "Create and configure the four house records.", to: "/console/houses", icon: House }, { label: "Upload roster", detail: "Import participants for one configured house.", to: "/console/upload", icon: FileUp }, { label: "Review roster", detail: "Search participant records and reveal status.", to: "/console/roster", icon: List }];

export function ConsoleDashboardPage() {
  return <section className="p-5 sm:p-8"><div className="mx-auto max-w-5xl"><p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-muted">Console overview</p><h1 className="m-0 text-[clamp(2.5rem,6vw,4.5rem)] leading-[.95] tracking-[-.075em]">Prepare the event roster.</h1><p className="mt-5 max-w-xl leading-relaxed text-muted">Set up the houses, load each participant list, and monitor reveal progress from one place.</p><div className="mt-10 grid gap-4 sm:grid-cols-3">{DASHBOARD_ACTIONS.map(({ icon: Icon, label, detail, to }) => <Link className="group rounded-md border border-line bg-white p-5 transition hover:-translate-y-1 hover:border-ink" key={to} to={to}><Icon size={19} /><h2 className="mb-1 mt-8 text-lg tracking-[-.04em]">{label}</h2><p className="m-0 text-sm leading-relaxed text-muted">{detail}</p><ArrowRight className="mt-6 transition-transform group-hover:translate-x-1" size={18} /></Link>)}</div></div></section>;
}
