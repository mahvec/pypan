import { Download, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { Button } from "@/shared/ui/Button";

export const PUBLIC_SITE_URL = "https://pypan.vercel.app/";

type PublicSiteQrCodeProps = {
  downloadable?: boolean;
  printable?: boolean;
  size?: number;
};

export function PublicSiteQrCode({ downloadable = false, printable = false, size = 184 }: PublicSiteQrCodeProps) {
  const qrRef = useRef<SVGSVGElement>(null);

  const getQrArtwork = () => {
    if (!qrRef.current) return null;
    const viewBox = qrRef.current.getAttribute("viewBox") ?? "0 0 41 41";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" role="img" aria-label="QR code for the PYPAN house reveal website"><rect width="1200" height="1200" fill="#ffffff"/><svg x="40" y="40" width="1120" height="1120" viewBox="${viewBox}">${qrRef.current.innerHTML}</svg></svg>`;
  };

  const handleDownload = () => {
    const artwork = getQrArtwork();
    if (!artwork) return;
    const source = `<?xml version="1.0" encoding="UTF-8"?>${artwork}`;
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pypan-house-reveal-qr.svg";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handlePrint = () => {
    const artwork = getQrArtwork();
    if (!artwork) return;
    const printWindow = window.open("", "_blank", "width=900,height=900");
    if (!printWindow) {
      window.alert("Please allow pop-ups to print the QR code.");
      return;
    }
    printWindow.document.open();
    printWindow.document.write(`<!doctype html><html><head><title>PYPAN House Reveal QR Code</title><style>@page{size:A4 portrait;margin:12mm}*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;font-family:Arial,sans-serif;color:#172554;background:#fff}.sheet{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center}.eyebrow{margin:0 0 12px;color:#c99a2e;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase}h1{margin:0;font-size:52px;letter-spacing:-.06em}p{margin:10px 0 22px;font-size:18px;color:#64748b}.qr{width:155mm;height:155mm;max-width:78vw;max-height:78vw}.url{margin-top:20px;font-size:16px;color:#172554}@media print{.sheet{min-height:calc(297mm - 24mm)}}</style></head><body><main class="sheet"><p class="eyebrow">PYPAN Inter-House Sports Day</p><h1>Find your house.</h1><p>Scan the code to discover your team.</p><div class="qr">${artwork}</div><strong class="url">${PUBLIC_SITE_URL}</strong></main><script>window.addEventListener("load",()=>setTimeout(()=>window.print(),150));window.addEventListener("afterprint",()=>window.close());</script></body></html>`);
    printWindow.document.close();
  };

  return <div className="grid justify-items-start gap-4"><a aria-label="Open the PYPAN house reveal website" className="inline-flex bg-white p-3" href={PUBLIC_SITE_URL}><QRCodeSVG bgColor="#ffffff" fgColor="#172554" level="H" marginSize={4} ref={qrRef} size={size} title="QR code for the PYPAN house reveal website" value={PUBLIC_SITE_URL} /></a>{downloadable || printable ? <div className="flex flex-wrap gap-2">{downloadable ? <Button onClick={handleDownload} type="button">Download <Download size={18} /></Button> : null}{printable ? <Button onClick={handlePrint} type="button">Print <Printer size={18} /></Button> : null}</div> : null}</div>;
}
