export type UploadRow = { rowNumber: number; name: string; phone?: string };

export function parseRosterCsv(source: string): UploadRow[] {
  return source.split(/\r?\n/).map((line, index) => ({ line, rowNumber: index + 1 })).filter(({ line }) => line.trim()).map(({ line, rowNumber }) => {
    const [name = "", phone] = line.split(",").map((value) => value.trim());
    return { rowNumber, name, phone: phone || undefined };
  });
}
