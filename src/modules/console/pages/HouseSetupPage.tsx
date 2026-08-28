import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "convex/react";
import { Plus, Users } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/shared/ui/Button";

const SESSION_KEY = "pypan-console-session";
const houseSchema = z.object({ name: z.string().trim().min(2, "Enter a house name."), namesake: z.string().trim().min(2, "Enter the biblical namesake."), food: z.string().trim().min(2, "Enter the food assignment."), colour: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Use a six-digit hex colour.") });
type HouseValues = z.infer<typeof houseSchema>;
type HouseRecord = { _id: string; name: string; namesake: string; food: string; colour: string; participantCount: number };

export function HouseSetupPage() {
  const [token] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [isCreating, setIsCreating] = useState(false);
  const isSessionValid = useQuery(api.auth.validateSession, token ? { token } : "skip");
  const houses = useQuery(api.houses.list, token && isSessionValid ? { sessionToken: token } : "skip");
  if (!token || isSessionValid === false) return <Navigate replace to="/console" />;
  if (isSessionValid === undefined || houses === undefined) return <PageStatus message="Loading houses..." />;
  return <section className="p-5 sm:p-8"><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-5"><div><p className="mb-3 text-[11px] font-bold uppercase tracking-[.14em] text-muted">House setup</p><h1 className="m-0 text-[clamp(2.5rem,6vw,4.5rem)] leading-[.95] tracking-[-.075em]">Houses</h1><p className="mt-4 max-w-xl leading-relaxed text-muted">Create the four event houses, then import each participant list separately.</p></div>{houses.length > 0 && houses.length < 4 ? <Button onClick={() => setIsCreating(true)}>Create house <Plus size={18} /></Button> : null}</div>{houses.length === 0 ? <EmptyState onCreate={() => setIsCreating(true)} /> : <HouseGrid houses={houses} />}{isCreating ? <HouseCreateForm token={token} onClose={() => setIsCreating(false)} /> : null}</div></section>;
}

function EmptyState({ onCreate }: { onCreate: () => void }) { return <section className="mt-10 grid min-h-72 place-items-center border border-dashed border-line bg-white/65 p-8 text-center"><div><Users className="mx-auto text-gold" size={30} /><h2 className="mb-2 mt-5 text-2xl tracking-[-.05em]">No houses yet.</h2><p className="mx-auto max-w-sm text-sm leading-relaxed text-muted">Begin by creating the first house. Participant uploads become available after setup.</p><Button className="mt-6" onClick={onCreate}>Create first house <Plus size={18} /></Button></div></section>; }
function HouseGrid({ houses }: { houses: HouseRecord[] }) { return <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{houses.map((house) => <article className="relative overflow-hidden border border-line bg-white p-5" key={house._id}><span className="absolute inset-x-0 top-0 h-1" style={{ backgroundColor: house.colour }} /><p className="m-0 text-[11px] font-bold uppercase tracking-[.12em] text-muted">{house.namesake}</p><h2 className="mb-6 mt-2 text-2xl tracking-[-.06em]">{house.name}</h2><div className="border-t border-line pt-4"><p className="m-0 text-3xl font-semibold tracking-[-.07em]">{house.participantCount}</p><p className="mt-1 text-sm text-muted">participants</p></div><p className="mb-0 mt-5 text-sm text-muted">Brings {house.food}</p></article>)}</div>; }
function HouseCreateForm({ token, onClose }: { token: string; onClose: () => void }) { const createHouse = useMutation(api.houses.create); const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<HouseValues>({ resolver: zodResolver(houseSchema) }); const submit = async (values: HouseValues) => { try { await createHouse({ sessionToken: token, ...values }); reset(); onClose(); toast.success("House created."); } catch (error) { toast.error(error instanceof Error ? error.message : "We could not create this house."); } }; return <form className="mt-10 grid gap-5 border-t border-line pt-8" noValidate onSubmit={handleSubmit(submit)}><div className="flex items-center justify-between"><h2 className="m-0 text-xl tracking-[-.04em]">Create house</h2><Button type="button" variant="text" onClick={onClose}>Cancel</Button></div><Field error={errors.name?.message} label="House name"><input className="console-input" {...register("name")} /></Field><Field error={errors.namesake?.message} label="Biblical namesake"><input className="console-input" {...register("namesake")} /></Field><Field error={errors.food?.message} label="Food assignment"><input className="console-input" {...register("food")} /></Field><Field error={errors.colour?.message} label="Primary colour"><input className="console-input" placeholder="#B71C1C" {...register("colour")} /></Field><Button disabled={isSubmitting} type="submit">{isSubmitting ? "Saving..." : "Create house"}<Plus size={18} /></Button></form>; }
function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) { return <label className="grid gap-2 text-sm font-bold">{label}{children}{error ? <span className="text-sm font-normal text-house-red">{error}</span> : null}</label>; }
function PageStatus({ message }: { message: string }) { return <main className="flex min-h-[60dvh] items-center justify-center"><p className="text-muted">{message}</p></main>; }
