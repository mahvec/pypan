import type { Participant } from "@/modules/house-reveal/types";

const normalise = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase();

export function searchParticipants(participants: Participant[], query: string) {
  const term = normalise(query);
  if (term.length < 3) return [];
  return participants.filter(({ name }) => normalise(name).includes(term)).slice(0, 10);
}
