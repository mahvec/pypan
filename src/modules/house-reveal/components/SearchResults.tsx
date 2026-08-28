import { ArrowRight } from "lucide-react";
import type { Participant } from "@/modules/house-reveal/types";

type SearchParticipant = Pick<Participant, "id" | "name">;

type SearchResultsProps = { participants: SearchParticipant[]; onSelect: (participant: SearchParticipant) => void };

export function SearchResults({ participants, onSelect }: SearchResultsProps) {
  return <div className="mt-5 border-t border-line" role="list">{participants.map((participant) => <button className="flex w-full items-center justify-between border-b border-line px-0.5 py-4 text-left text-[17px] transition hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" key={participant.id} onClick={() => onSelect(participant)} role="listitem">{participant.name}<ArrowRight size={18} /></button>)}</div>;
}
