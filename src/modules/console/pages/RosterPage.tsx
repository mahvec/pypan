import { useQuery } from "convex/react";
import { ArrowLeft, Search } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../../../../convex/_generated/api";
import { BrandMark } from "@/shared/ui/BrandMark";

const SESSION_KEY = "pypan-console-session";

export function RosterPage() {
  const [token] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [search, setSearch] = useState("");
  const [houseId, setHouseId] = useState("");
  const [verified, setVerified] = useState("all");
  const isSessionValid = useQuery(api.auth.validateSession, token ? { token } : "skip");
  const houses = useQuery(api.houses.list, token && isSessionValid ? { sessionToken: token } : "skip");
  const participants = useQuery(api.participants.listForConsole, token && isSessionValid ? { sessionToken: token, search: search || undefined, houseId: houseId ? houseId as never : undefined, verified: verified === "all" ? undefined : verified === "verified" } : "skip");
  if (!token || isSessionValid === false) return <Navigate replace to="/console" />;
  if (isSessionValid === undefined || houses === undefined || participants === undefined) return <RosterLoading />;
  const houseNames = new Map(houses.map((house) => [house._id, house.name]));
  return <main className="min-h-[100dvh] bg-paper p-5 sm:p-6"><header className="flex items-center justify-between gap-4"><BrandMark /><Link className="inline-flex items-center gap-1 text-sm font-bold" to="/console/dashboard"><ArrowLeft size={18} />Console</Link></header><section className="mx-auto mt-16 max-w-5xl"><p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em]">Roster</p><h1 className="m-0 text-[clamp(3rem,8vw,5.5rem)] leading-[.91] tracking-[-.075em]">Every participant, in one place.</h1><div className="mt-10 grid gap-3 md:grid-cols-[1fr_12rem_10rem]"><label className="flex items-center gap-2 rounded-md border border-line bg-white px-3"><Search size={18} /><span className="sr-only">Search roster</span><input className="w-full py-3 outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name" /></label><select className="console-input" value={houseId} onChange={(event) => setHouseId(event.target.value)}><option value="">All houses</option>{houses.map((house) => <option key={house._id} value={house._id}>{house.name}</option>)}</select><select className="console-input" value={verified} onChange={(event) => setVerified(event.target.value)}><option value="all">All states</option><option value="verified">Verified</option><option value="unverified">Not verified</option></select></div><RosterTable participants={participants} houseNames={houseNames} /></section></main>;
}

function RosterTable({ participants, houseNames }: { participants: Array<{ _id: string; name: string; houseId: string; firstVerifiedAt?: number }>; houseNames: Map<string, string> }) { if (participants.length === 0) return <p className="mt-10 border-y border-line py-6 text-muted">No participants match these filters.</p>; return <div className="mt-10 overflow-x-auto"><table className="w-full min-w-160 border-collapse text-left text-sm"><thead className="border-b border-line text-muted"><tr><th className="pb-3 font-medium">Participant</th><th className="pb-3 font-medium">House</th><th className="pb-3 font-medium">Reveal</th><th className="pb-3 font-medium">First verified</th></tr></thead><tbody>{participants.map((participant) => <tr className="border-b border-line" key={participant._id}><td className="py-4 font-bold">{participant.name}</td><td className="py-4">{houseNames.get(participant.houseId) ?? "Unknown"}</td><td className="py-4">{participant.firstVerifiedAt ? "Verified" : "Not verified"}</td><td className="py-4 text-muted">{participant.firstVerifiedAt ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(participant.firstVerifiedAt) : "-"}</td></tr>)}</tbody></table></div>; }
function RosterLoading() { return <main className="flex min-h-[100dvh] items-center justify-center bg-paper"><p className="text-muted">Loading roster...</p></main>; }
