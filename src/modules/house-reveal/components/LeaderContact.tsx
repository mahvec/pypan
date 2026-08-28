import { Phone } from "lucide-react";
import type { Leader } from "@/modules/house-reveal/types";

type LeaderContactProps = { label: string; leader: Leader };

export function LeaderContact({ label, leader }: LeaderContactProps) {
  return <div className="flex flex-col gap-1"><span className="text-xs font-bold uppercase tracking-[.1em] opacity-75">{label}</span><strong className="text-sm sm:text-base">{leader.name}</strong><a className="flex w-max items-center gap-1 text-sm underline underline-offset-4" href={`tel:${leader.phone}`}>{leader.phone}<Phone size={15} /></a></div>;
}
