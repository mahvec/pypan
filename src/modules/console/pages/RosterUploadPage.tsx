import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Download, FileUp } from "lucide-react";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { api } from "../../../../convex/_generated/api";
import { BrandMark } from "@/shared/ui/BrandMark";
import { Button } from "@/shared/ui/Button";
import { parseRosterCsv, type UploadRow } from "@/modules/console/utils/parseRosterCsv";

const SESSION_KEY = "pypan-console-session";

export function RosterUploadPage() {
  const [token] = useState(() => sessionStorage.getItem(SESSION_KEY));
  const [houseId, setHouseId] = useState<string>("");
  const [rows, setRows] = useState<UploadRow[]>([]);
  const isSessionValid = useQuery(api.auth.validateSession, token ? { token } : "skip");
  const houses = useQuery(api.houses.list, token && isSessionValid ? { sessionToken: token } : "skip");
  const preview = useQuery(api.participants.previewUpload, token && houseId && rows.length ? { sessionToken: token, houseId: houseId as never, rows } : "skip");
  const commitUpload = useMutation(api.participants.commitUpload);
  if (!token || isSessionValid === false) return <Navigate replace to="/console" />;
  if (isSessionValid === undefined || houses === undefined) return <Loading />;
  const handleFile = async (file: File | undefined) => { if (!file) return; setRows(parseRosterCsv(await file.text())); };
  const selectedHouse = houses.find((house) => house._id === houseId);
  const handleTemplateDownload = () => {
    if (!selectedHouse) return;
    const url = URL.createObjectURL(new Blob(["\uFEFFname,phone\r\n"], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedHouse.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}-participants-template.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };
  const handleCommit = async () => { if (!houseId || !rows.length) return; try { const result = await commitUpload({ sessionToken: token, houseId: houseId as never, rows }); toast.success(`${result.accepted} participants added.`); setRows([]); } catch { toast.error("The upload could not be committed."); } };
  return <main className="min-h-[100dvh] bg-paper p-5 sm:p-6"><header className="flex items-center justify-between gap-4"><BrandMark /><Link className="inline-flex items-center gap-1 text-sm font-bold" to="/console/dashboard"><ArrowLeft size={18} />Console</Link></header><section className="mx-auto mt-16 max-w-3xl"><p className="mb-3.5 text-[11px] font-bold uppercase tracking-[.14em]">Roster upload</p><h1 className="m-0 text-[clamp(3rem,8vw,5.5rem)] leading-[.91] tracking-[-.075em]">Upload one house at a time.</h1><div className="mt-10 grid gap-5"><label className="grid gap-2 text-sm font-bold">House<select className="console-input" value={houseId} onChange={(event) => { setHouseId(event.target.value); setRows([]); }}><option value="">Choose a configured house</option>{houses.map((house) => <option key={house._id} value={house._id}>{house.name}</option>)}</select></label><div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-white p-4"><div><p className="m-0 text-sm font-bold">Participant CSV template</p><p className="mb-0 mt-1 text-sm text-muted">Download, add names and optional phone numbers, then upload it below.</p></div><Button disabled={!selectedHouse} onClick={handleTemplateDownload} type="button">Download template <Download size={18} /></Button></div><label className="grid gap-2 text-sm font-bold">CSV roster<input accept=".csv,text/csv" className="console-input" disabled={!houseId} type="file" onChange={(event) => void handleFile(event.target.files?.[0])} /></label><p className="m-0 text-sm text-muted">The selected house is applied to every participant in the file. Keep the <strong>name</strong> and <strong>phone</strong> headings; phone numbers are optional.</p></div><UploadPreview preview={preview} onCommit={handleCommit} /></section></main>;
}

function UploadPreview({ preview, onCommit }: { preview: Array<UploadRow & { accepted: boolean; reason?: string }> | undefined; onCommit: () => void }) { if (!preview) return null; const accepted = preview.filter((row) => row.accepted).length; return <section className="mt-10 border-t border-line pt-8"><h2 className="m-0 text-xl tracking-[-.04em]">Preview</h2><p className="mt-2 text-muted">{accepted} accepted, {preview.length - accepted} rejected.</p><div className="mt-5 max-h-80 overflow-auto border-t border-line">{preview.map((row) => <div className="grid grid-cols-[auto_1fr] gap-4 border-b border-line py-3 text-sm" key={row.rowNumber}><span className="text-muted">{row.rowNumber}</span><span>{row.name || "Blank name"}<small className={row.accepted ? "ml-2 text-house-green" : "ml-2 text-house-red"}>{row.accepted ? "Accepted" : row.reason}</small></span></div>)}</div><Button className="mt-6" disabled={accepted === 0} onClick={onCommit}>Commit accepted rows<FileUp size={18} /></Button></section>; }
function Loading() { return <main className="flex min-h-[100dvh] items-center justify-center bg-paper"><p className="text-muted">Loading upload tools...</p></main>; }
