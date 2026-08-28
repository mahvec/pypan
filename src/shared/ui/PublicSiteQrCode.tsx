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

  const handleDownload = () => {
    if (!qrRef.current) return;
    const source = new XMLSerializer().serializeToString(qrRef.current);
    const url = URL.createObjectURL(new Blob([source], { type: "image/svg+xml;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "pypan-house-reveal-qr.svg";
    link.click();
    URL.revokeObjectURL(url);
  };

  return <div className="grid justify-items-start gap-4"><a aria-label="Open the PYPAN house reveal website" className="inline-flex bg-white p-3" href={PUBLIC_SITE_URL}><QRCodeSVG bgColor="#ffffff" fgColor="#172554" level="H" marginSize={4} ref={qrRef} size={size} title="QR code for the PYPAN house reveal website" value={PUBLIC_SITE_URL} /></a>{downloadable || printable ? <div className="flex flex-wrap gap-2">{downloadable ? <Button onClick={handleDownload} type="button">Download <Download size={18} /></Button> : null}{printable ? <Button onClick={() => window.print()} type="button">Print <Printer size={18} /></Button> : null}</div> : null}{printable ? <section aria-hidden="true" className="qr-print-sheet"><p className="qr-print-eyebrow">PYPAN Inter-House Sports Day</p><h1>Find your house.</h1><p>Scan the code to discover your team.</p><QRCodeSVG bgColor="#ffffff" fgColor="#172554" level="H" marginSize={4} size={360} value={PUBLIC_SITE_URL} /><strong>{PUBLIC_SITE_URL}</strong></section> : null}</div>;
}
