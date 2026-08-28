import { Download } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useRef } from "react";
import { Button } from "@/shared/ui/Button";

export const PUBLIC_SITE_URL = "https://pypan.vercel.app/";

type PublicSiteQrCodeProps = {
  downloadable?: boolean;
  size?: number;
};

export function PublicSiteQrCode({ downloadable = false, size = 184 }: PublicSiteQrCodeProps) {
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

  return <div className="grid justify-items-start gap-4"><a aria-label="Open the PYPAN house reveal website" className="inline-flex bg-white p-3" href={PUBLIC_SITE_URL}><QRCodeSVG bgColor="#ffffff" fgColor="#172554" level="H" marginSize={4} ref={qrRef} size={size} title="QR code for the PYPAN house reveal website" value={PUBLIC_SITE_URL} /></a>{downloadable ? <Button onClick={handleDownload} type="button">Download QR code <Download size={18} /></Button> : null}</div>;
}
