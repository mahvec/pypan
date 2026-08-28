import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Pencil, Plus, Trash2, UserRoundCog, Users } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import type { Doc } from "../../../../convex/_generated/dataModel";
import { Button } from "@/shared/ui/Button";

const SESSION_KEY = "pypan-console-session";
const houseSchema = z.object({ name: z.string().trim().min(2, "Enter a house name."), namesake: z.string().trim().min(2, "Enter the biblical namesake."), food: z.string().trim().min(2, "Enter the food assignment."), colour: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex colour.") });
type HouseValues = z.infer<typeof houseSchema>;
type HouseRecord = Doc<"houses"> & { participantCount: number };
type ParticipantRecord = Doc<"participants">;

export function HouseSetupPage() {
  const [token] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [isCreating, setIsCreating] = useState(false);
  const isSessionValid = useQuery(api.auth.validateSession, token ? { token } : "skip");
  const houses = useQuery(api.houses.list, token && isSessionValid ? { sessionToken: token } : "skip");
  const participants = useQuery(api.participants.listForConsole, token && isSessionValid ? { sessionToken: token } : "skip");
  if (!token || isSessionValid === false) return <Navigate replace to="/console" />;
  if (isSessionValid === undefined || houses === undefined || participants === undefined) return <PageStatus message="Loading houses..." />;
  return <section className="p-5 sm:p-8"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-muted">House setup</p><h1 className="m-0 text-[clamp(2.5rem,6vw,4.5rem)] leading-[.95] tracking-[-.075em]">Houses</h1><p className="mt-4 max-w-xl leading-relaxed text-muted">Create the four event houses, upload their participants, then assign each house captain and vice captain.</p></div>{houses.length > 0 && houses.length < 4 ? <Button onClick={() => setIsCreating(true)}>Create house <Plus size={18} /></Button> : null}</div>{houses.length === 0 ? <EmptyState onCreate={() => setIsCreating(true)} /> : <HouseGrid houses={houses} participants={participants} token={token} />}{isCreating ? <HouseCreateForm token={token} onClose={() => setIsCreating(false)} /> : null}</div></section>;
}

function EmptyState({ onCreate }: { onCreate: () => void }) { return <section className="mt-10 grid min-h-72 place-items-center border border-dashed border-line bg-white/65 p-8 text-center"><div><Users className="mx-auto text-gold" size={30} /><h2 className="mb-2 mt-5 text-2xl tracking-[-.05em]">No houses yet.</h2><p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">Begin by creating the first house. Participant uploads become available after setup.</p><Button className="mt-6" onClick={onCreate}>Create first house <Plus size={18} /></Button></div></section>; }

function HouseGrid({ houses, participants, token }: { houses: HouseRecord[]; participants: ParticipantRecord[]; token: string }) {
  const [leadershipHouseId, setLeadershipHouseId] = useState<string | null>(null);
  const [detailsHouseId, setDetailsHouseId] = useState<string | null>(null);
  const leadershipHouse = houses.find((house) => house._id === leadershipHouseId);
  const detailsHouse = houses.find((house) => house._id === detailsHouseId);
  const removeHouse = useMutation(api.houses.remove);
  const participantName = (participantId: string | undefined) => participants.find((participant) => participant._id === participantId)?.name;
  const handleDelete = async (house: HouseRecord) => {
    const participantWarning = house.participantCount ? ` and all ${house.participantCount} participants assigned to it` : "";
    if (!window.confirm(`Delete ${house.name}${participantWarning}? This cannot be undone.`)) return;
    try {
      const result = await removeHouse({ sessionToken: token, houseId: house._id });
      setLeadershipHouseId(null);
      setDetailsHouseId(null);
      toast.success(`${house.name} and ${result.deletedParticipants} participants were deleted.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not delete this house.");
    }
  };
  return <><div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{houses.map((house) => <article className="relative overflow-hidden border border-line bg-white p-5" key={house._id}><span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: house.colour }} /><p className="m-0 text-[11px] font-bold uppercase tracking-[.12em] text-muted">{house.namesake}</p><h2 className="mb-6 mt-2 text-2xl tracking-[-.06em]">{house.name}</h2><div className="border-t border-line pt-4"><p className="m-0 text-3xl font-semibold tracking-[-.07em]">{house.participantCount}</p><p className="mt-1 text-sm text-muted">participants</p></div><dl className="mb-0 mt-5 grid gap-3 text-sm"><div><dt className="text-muted">Captain</dt><dd className="m-0 font-bold">{participantName(house.captainId) ?? "Not assigned"}</dd></div><div><dt className="text-muted">Vice captain</dt><dd className="m-0 font-bold">{participantName(house.viceCaptainId) ?? "Not assigned"}</dd></div></dl><Button className="mt-5 w-full" disabled={house.participantCount < 2} onClick={() => { setLeadershipHouseId(house._id); setDetailsHouseId(null); }}>{house.captainId && house.viceCaptainId ? "Change leaders" : "Assign leaders"}<UserRoundCog size={18} /></Button><div className="mt-4 flex items-center justify-between border-t border-line pt-4"><Button onClick={() => { setDetailsHouseId(house._id); setLeadershipHouseId(null); }} type="button" variant="text"><Pencil size={17} />Edit</Button><Button className="text-house-red" onClick={() => void handleDelete(house)} type="button" variant="text"><Trash2 size={17} />Delete</Button></div></article>)}</div>{leadershipHouse ? <LeadershipForm house={leadershipHouse} participants={participants.filter((participant) => participant.houseId === leadershipHouse._id)} token={token} onClose={() => setLeadershipHouseId(null)} /> : null}{detailsHouse ? <HouseEditForm house={detailsHouse} token={token} onClose={() => setDetailsHouseId(null)} /> : null}</>;
}

function LeadershipForm({ house, participants, token, onClose }: { house: HouseRecord; participants: ParticipantRecord[]; token: string; onClose: () => void }) {
  const [captainId, setCaptainId] = useState<string>(house.captainId ?? "");
  const [viceCaptainId, setViceCaptainId] = useState<string>(house.viceCaptainId ?? "");
  const [captainPhone, setCaptainPhone] = useState(() => participants.find((participant) => participant._id === house.captainId)?.phone ?? "");
  const [viceCaptainPhone, setViceCaptainPhone] = useState(() => participants.find((participant) => participant._id === house.viceCaptainId)?.phone ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const updateParticipant = useMutation(api.participants.update);
  const setLeadership = useMutation(api.houses.setLeadership);
  const selectCaptain = (id: string) => { setCaptainId(id); setCaptainPhone(participants.find((participant) => participant._id === id)?.phone ?? ""); };
  const selectViceCaptain = (id: string) => { setViceCaptainId(id); setViceCaptainPhone(participants.find((participant) => participant._id === id)?.phone ?? ""); };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const captain = participants.find((participant) => participant._id === captainId);
    const viceCaptain = participants.find((participant) => participant._id === viceCaptainId);
    if (!captain || !viceCaptain) { toast.error("Choose both leaders."); return; }
    if (captain._id === viceCaptain._id) { toast.error("Captain and vice captain must be different people."); return; }
    if (!captainPhone.trim() || !viceCaptainPhone.trim()) { toast.error("Enter a phone number for both leaders."); return; }
    setIsSaving(true);
    try {
      await updateParticipant({ sessionToken: token, participantId: captain._id, name: captain.name, phone: captainPhone.trim(), houseId: house._id });
      await updateParticipant({ sessionToken: token, participantId: viceCaptain._id, name: viceCaptain.name, phone: viceCaptainPhone.trim(), houseId: house._id });
      await setLeadership({ sessionToken: token, houseId: house._id, captainId: captain._id, viceCaptainId: viceCaptain._id });
      toast.success(`Leaders assigned to ${house.name}.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not assign the house leaders.");
    } finally {
      setIsSaving(false);
    }
  };
  return <form className="mt-8 border border-line bg-white p-5 sm:p-7" onSubmit={submit}><div className="flex items-start justify-between gap-4"><div><p className="m-0 text-[11px] font-bold uppercase tracking-[.14em] text-gold">Leadership</p><h2 className="mb-0 mt-2 text-2xl tracking-[-.05em]">Assign leaders for {house.name}</h2></div><Button onClick={onClose} type="button" variant="text">Cancel</Button></div>{participants.length < 2 ? <p className="mt-6 text-sm text-house-red">Upload at least two participants to this house before assigning its leaders.</p> : <><div className="mt-7 grid gap-6 sm:grid-cols-2"><LeaderFields label="Captain" participants={participants} participantId={captainId} phone={captainPhone} onParticipantChange={selectCaptain} onPhoneChange={setCaptainPhone} /><LeaderFields label="Vice captain" participants={participants} participantId={viceCaptainId} phone={viceCaptainPhone} onParticipantChange={selectViceCaptain} onPhoneChange={setViceCaptainPhone} /></div><Button className="mt-7" disabled={isSaving} type="submit">{isSaving ? "Saving leaders..." : "Save leadership"}<UserRoundCog size={18} /></Button></>}</form>;
}

function LeaderFields({ label, participants, participantId, phone, onParticipantChange, onPhoneChange }: { label: string; participants: ParticipantRecord[]; participantId: string; phone: string; onParticipantChange: (id: string) => void; onPhoneChange: (phone: string) => void }) {
  return <fieldset className="grid gap-4 border-0 p-0"><legend className="mb-3 text-lg font-bold">{label}</legend><label className="grid gap-2 text-sm font-bold">Participant<select className="console-input" value={participantId} onChange={(event) => onParticipantChange(event.target.value)}><option value="">Choose a participant</option>{participants.map((participant) => <option key={participant._id} value={participant._id}>{participant.name}</option>)}</select></label><label className="grid gap-2 text-sm font-bold">Phone number<input className="console-input" disabled={!participantId} inputMode="tel" value={phone} onChange={(event) => onPhoneChange(event.target.value)} placeholder="e.g. 08012345678" /></label></fieldset>;
}

function HouseEditForm({ house, token, onClose }: { house: HouseRecord; token: string; onClose: () => void }) {
  const updateHouse = useMutation(api.houses.update);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<HouseValues>({ resolver: zodResolver(houseSchema), defaultValues: { name: house.name, namesake: house.namesake, food: house.food, colour: house.colour } });
  const submit = async (values: HouseValues) => {
    try {
      await updateHouse({ sessionToken: token, houseId: house._id, ...values });
      toast.success(`${values.name} was updated.`);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not update this house.");
    }
  };
  return <form className="mt-8 grid gap-5 border border-line bg-white p-5 sm:p-7" noValidate onSubmit={handleSubmit(submit)}><div className="flex items-start justify-between gap-4"><div><p className="m-0 text-[11px] font-bold uppercase tracking-[.14em] text-gold">Edit house</p><h2 className="mb-0 mt-2 text-2xl tracking-[-.05em]">{house.name}</h2></div><Button type="button" variant="text" onClick={onClose}>Cancel</Button></div><div className="grid gap-5 sm:grid-cols-2"><Field error={errors.name?.message} label="House name"><input className="console-input" {...register("name")} /></Field><Field error={errors.namesake?.message} label="Biblical namesake"><input className="console-input" {...register("namesake")} /></Field><Field error={errors.food?.message} label="Food assignment"><input className="console-input" {...register("food")} /></Field><Field error={errors.colour?.message} label="Primary colour"><input className="console-input" {...register("colour")} /></Field></div><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Saving..." : "Save house"}<Pencil size={18} /></Button></form>;
}

function HouseCreateForm({ token, onClose }: { token: string; onClose: () => void }) { const createHouse = useMutation(api.houses.create); const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HouseValues>({ resolver: zodResolver(houseSchema) }); const submit = async (values: HouseValues) => { try { await createHouse({ sessionToken: token, ...values }); reset(); onClose(); toast.success("House created."); } catch (error) { toast.error(error instanceof Error ? error.message : "We could not create this house."); } }; return <form className="mt-10 grid gap-5 border-t border-line pt-8" noValidate onSubmit={handleSubmit(submit)}><div className="flex items-center justify-between"><h2 className="m-0 text-xl tracking-[-.04em]">Create house</h2><Button type="button" variant="text" onClick={onClose}>Cancel</Button></div><Field error={errors.name?.message} label="House name"><input className="console-input" {...register("name")} /></Field><Field error={errors.namesake?.message} label="Biblical namesake"><input className="console-input" {...register("namesake")} /></Field><Field error={errors.food?.message} label="Food assignment"><input className="console-input" {...register("food")} /></Field><Field error={errors.colour?.message} label="Primary colour"><input className="console-input" placeholder="#B71C1C" {...register("colour")} /></Field><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Saving..." : "Create house"}<Plus size={18} /></Button></form>; }
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="grid gap-2 text-sm font-bold">{label}{children}{error ? <span className="text-sm font-normal text-house-red">{error}</span> : null}</label>; }
function PageStatus({ message }: { message: string }) { return <main className="flex min-h-[60dvh] items-center justify-center"><p className="text-muted">{message}</p></main>; }
