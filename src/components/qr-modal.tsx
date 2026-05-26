"use client";
import { X, Download } from "lucide-react";
import { QRCode } from "react-qrcode-logo";
import { useRef } from "react";

interface QrModalProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export function QrModal({ url, onClose, title = "Scan to view profile" }: QrModalProps) {
  const qrRef = useRef<any>(null);

  const downloadQr = () => {
    const canvas = document.getElementById("react-qrcode-logo") as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = "profile-qr.png";
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card w-full max-w-sm rounded-3xl border border-border shadow-2xl overflow-hidden flex flex-col">
        <div className="px-5 py-4 flex items-center justify-between border-b border-border">
          <h3 className="font-semibold">{title}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-8 flex flex-col items-center justify-center bg-white">
          <QRCode
            value={url}
            size={200}
            qrStyle="dots"
            eyeRadius={10}
            fgColor="#000000"
            bgColor="#ffffff"
            id="react-qrcode-logo"
            ref={qrRef}
          />
        </div>
        <div className="px-5 py-4 border-t border-border bg-muted/20 flex justify-center">
          <button
            onClick={downloadQr}
            className="w-full px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" /> Download QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
