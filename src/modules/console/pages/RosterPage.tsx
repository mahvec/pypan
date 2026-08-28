import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Pencil, Search, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Button } from "@/shared/ui/Button";

const SESSION_KEY = "pypan-console-session";
type ParticipantRecord = Doc<"participants">;
type HouseRecord = Doc<"houses"> & { participantCount: number };

export function RosterPage() {
  const [token] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [search, setSearch] = useState("");
  const [houseId, setHouseId] = useState("");
  const [verified, setVerified] = useState("all");
  const [editingParticipant, setEditingParticipant] = useState<ParticipantRecord | null>(null);
  const isSessionValid = useQuery(api.auth.validateSession, token ? { token } : "skip");
  const houses = useQuery(api.houses.list, token && isSessionValid ? { sessionToken: token } : "skip");
  const participants = useQuery(api.participants.listForConsole, token && isSessionValid ? { sessionToken: token, search: search || undefined, houseId: houseId ? houseId as never : undefined, verified: verified === "all" ? undefined : verified === "verified" } : "skip");
  const removeParticipant = useMutation(api.participants.remove);
  if (!token || isSessionValid === false) return <Navigate replace to="/console" />;
  if (isSessionValid === undefined || houses === undefined || participants === undefined) return <RosterLoading />;
  const houseNames = new Map(houses.map((house) => [house._id, house.name]));
  const handleDelete = async (participant: ParticipantRecord) => {
    if (!window.confirm(`Delete ${participant.name}? This cannot be undone.`)) return;
    try {
      await removeParticipant({ sessionToken: token, participantId: participant._id });
      if (editingParticipant?._id === participant._id) setEditingParticipant(null);
      toast.success(`${participant.name} was deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not delete this participant.");
    }
  };
  return <main className="min-h-[100dvh] bg-paper p-5 sm:p-6"><header className="flex items-center justify-between gap-4"><BrandMark /><Link className="inline-flex items-center gap-1 text-sm font-bold" to="/console/dashboard"><ArrowLeft size={18} />Console</Link></header><section className="mx-auto mt-16 max-w-5xl"><p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em]">Roster</p><h1 className="m-0 text-[clamp(3rem,8vw,5.5rem)] leading-[.91] tracking-[-.075em]">Every participant, in one place.</h1><div className="mt-10 grid gap-3 md:grid-cols-[1fr_12rem_10rem]"><label className="flex items-center gap-2 rounded-md border border-line bg-white px-3"><Search size={18} /><span className="sr-only">Search roster</span><input className="w-full py-3 outline-none" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name" /></label><select className="console-input" value={houseId} onChange={(event) => setHouseId(event.target.value)}><option value="">All houses</option>{houses.map((house) => <option key={house._id} value={house._id}>{house.name}</option>)}</select><select className="console-input" value={verified} onChange={(event) => setVerified(event.target.value)}><option value="all">All states</option><option value="verified">Verified</option><option value="unverified">Not verified</option></select></div>{editingParticipant ? <ParticipantEditForm houses={houses} participant={editingParticipant} token={token} onClose={() => setEditingParticipant(null)} /> : null}<RosterTable participants={participants} houseNames={houseNames} onDelete={handleDelete} onEdit={setEditingParticipant} /></section></main>;
}

function ParticipantEditForm({ participant, houses, token, onClose }: { participant: ParticipantRecord; houses: HouseRecord[]; token: string; onClose: () => void }) {
  const [name, setName] = useState(participant.name);
  const [phone, setPhone] = useState(participant.phone ?? "");
  const [houseId, setHouseId] = useState<string>(participant.houseId);
  const [isSaving, setIsSaving] = useState(false);
  const updateParticipant = useMutation(api.participants.update);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !houseId) { toast.error("Name and house are required."); return; }
    setIsSaving(true);
    try {
      await updateParticipant({ sessionToken: token, participantId: participant._id, name: name.trim(), phone: phone.trim() || undefined, houseId: houseId as never });
      toast.success(`${name.trim()} was updated.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not update this participant.");
    } finally {
      setIsSaving(false);
    }
  };
  return <form className="mt-8 border border-line bg-white p-5 sm:p-7" onSubmit={submit}><div className="flex items-start justify-between gap-4"><div><p className="m-0 text-[11px] font-bold uppercase tracking-[.14em] text-gold">Edit participant</p><h2 className="mb-0 mt-2 text-2xl tracking-[-.05em]">{participant.name}</h2></div><Button onClick={onClose} type="button" variant="text">Cancel</Button></div><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="grid gap-2 text-sm font-bold">Full name<input className="console-input" value={name} onChange={(event) => setName(event.target.value)} /></label><label className="grid gap-2 text-sm font-bold">Phone number<input className="console-input" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></label><label className="grid gap-2 text-sm font-bold sm:col-span-2">House<select className="console-input" value={houseId} onChange={(event) => setHouseId(event.target.value)}>{houses.map((house) => <option key={house._id} value={house._id}>{house.name}</option>)}</select></label></div><Button className="mt-6" disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save participant"}<Pencil size={18} /></Button></form>;
}

function RosterTable({ participants, houseNames, onEdit, onDelete }: { participants: ParticipantRecord[]; houseNames: Map<string, string>; onEdit: (participant: ParticipantRecord) => void; onDelete: (participant: ParticipantRecord) => void }) {
  if (participants.length === 0) return <p className="mt-10 border-y border-line py-6 text-muted">No participants match these filters.</p>;
  return <div className="mt-10 overflow-x-auto"><table className="w-full min-w-190 border-collapse text-left text-sm"><thead className="border-b border-line text-muted"><tr><th className="pb-3 font-medium">Participant</th><th className="pb-3 font-medium">Phone</th><th className="pb-3 font-medium">House</th><th className="pb-3 font-medium">Reveal</th><th className="pb-3 font-medium">First verified</th><th className="pb-3 text-right font-medium">Actions</th></tr></thead><tbody>{participants.map((participant) => <tr className="border-b border-line" key={participant._id}><td className="py-4 font-bold">{participant.name}</td><td className="py-4 text-muted">{participant.phone ?? "-"}</td><td className="py-4">{houseNames.get(participant.houseId) ?? "Unknown"}</td><td className="py-4">{participant.firstVerifiedAt ? "Verified" : "Not verified"}</td><td className="py-4 text-muted">{participant.firstVerifiedAt ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(participant.firstVerifiedAt) : "-"}</td><td className="py-4"><div className="flex justify-end gap-4"><Button aria-label={`Edit ${participant.name}`} onClick={() => onEdit(participant)} type="button" variant="text"><Pencil size={17} />Edit</Button><Button aria-label={`Delete ${participant.name}`} className="text-house-red" onClick={() => onDelete(participant)} type="button" variant="text"><Trash2 size={17} />Delete</Button></div></td></tr>)}</tbody></table></div>;
}

function RosterLoading() { return <main className="flex min-h-[100dvh] items-center justify-center bg-paper"><p className="text-muted">Loading roster...</p></main>; }
