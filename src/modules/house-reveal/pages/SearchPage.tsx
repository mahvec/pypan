import { ArrowLeft, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { toast } from "sonner";
import { isConvexConfigured, RECORD_REVEAL, SEARCH_PARTICIPANTS, type PublicSearchResult } from "@/app/convex";
import { PREVIEW_PARTICIPANTS } from "@/modules/house-reveal/constants";
import { SearchResults } from "@/modules/house-reveal/components/SearchResults";
import { searchParticipants } from "@/modules/house-reveal/utils/searchParticipants";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Button } from "@/shared/ui/Button";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  if (isConvexConfigured) return <ConnectedSearch query={query} onChange={setQuery} onNavigate={navigate} />;
  return <PreviewSearch query={query} onChange={setQuery} onNavigate={navigate} />;
}

type SearchRouteProps = { query: string; onChange: (query: string) => void; onNavigate: ReturnType<typeof useNavigate> };

function PreviewSearch({ query, onChange, onNavigate }: SearchRouteProps) {
  const results = useMemo(() => searchParticipants(PREVIEW_PARTICIPANTS, query), [query]);
  return <SearchScreen query={query} onChange={onChange} participants={results} onSelect={(participant) => onNavigate(`/reveal/${participant.id}`)} />;
}

function ConnectedSearch({ query, onChange, onNavigate }: SearchRouteProps) {
  const participants = useQuery(SEARCH_PARTICIPANTS, query.trim().length >= 3 ? { term: query } : "skip");
  const recordReveal = useMutation(RECORD_REVEAL);
  const handleSelect = (participant: SearchItem) => {
    void recordReveal({ participantId: participant.id as PublicSearchResult["id"] }).catch(() => toast.error("We could not record this reveal. Your house is still available."));
    onNavigate(`/reveal/${participant.id}`);
  };
  return <SearchScreen query={query} onChange={onChange} participants={participants ?? []} isLoading={participants === undefined && query.trim().length >= 3} onSelect={handleSelect} />;
}

type SearchItem = { id: string; name: string };
type SearchScreenProps = { query: string; onChange: (query: string) => void; participants: SearchItem[]; isLoading?: boolean; onSelect: (participant: SearchItem) => void };

function SearchScreen({ query, onChange, participants, isLoading = false, onSelect }: SearchScreenProps) {
  const hasSearchTerm = query.trim().length >= 3;
  const navigate = useNavigate();
  return <main className="min-h-[100dvh] bg-white p-5 sm:p-6"><header className="flex items-start justify-between gap-4"><BrandMark /><Button variant="text" onClick={() => navigate("/")}><ArrowLeft size={18} />Back</Button></header><section className="mx-auto mt-[13vh] max-w-157.5"><p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em]">Find your name</p><h1 className="m-0 text-[clamp(3rem,10vw,7rem)] leading-[.91] tracking-[-.075em]">Start typing.</h1><label className="mt-7 flex items-center gap-3 border-b-2 border-ink py-3"><Search size={21} /><span className="sr-only">Search participant name</span><input autoFocus className="w-full border-0 bg-transparent text-xl outline-none placeholder:text-muted" onChange={(event) => onChange(event.target.value)} placeholder="Enter at least 3 letters" value={query} /></label><SearchFeedback hasSearchTerm={hasSearchTerm} hasResults={participants.length > 0} isLoading={isLoading} /><SearchResults participants={participants} onSelect={onSelect} /></section></main>;
}

function SearchFeedback({ hasSearchTerm, hasResults, isLoading }: { hasSearchTerm: boolean; hasResults: boolean; isLoading: boolean }) {
  if (!hasSearchTerm) return <p className="mt-4 leading-relaxed text-muted">Search works with any part of your full name.</p>;
  if (isLoading) return <p className="mt-4 leading-relaxed text-muted">Searching the roster...</p>;
  if (!hasResults) return <p className="mt-4 max-w-97.5 leading-relaxed text-muted">We could not find that name. Please ask an organiser for assistance.</p>;
  return null;
}
