"use client";

import { useEffect, useRef, useState } from "react";

interface QrScannerProps {
  onResult: (decodedText: string) => void;
  active: boolean;
}

const REGION_ID = "inventaris-qr-reader";

export default function QrScanner({ onResult, active }: QrScannerProps) {
  const scannerRef = useRef<import("html5-qrcode").Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;
    setStarting(true);
    setError(null);

    import("html5-qrcode").then(async ({ Html5Qrcode }) => {
      if (cancelled) return;
      const instance = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = instance;

      try {
        await instance.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            onResult(decodedText);
          },
          () => {
            // diabaikan: dipanggil terus-menerus setiap frame gagal decode
          }
        );
      } catch (err) {
        if (!cancelled) {
          setError(
            "Tidak bisa mengakses kamera. Pastikan izin kamera diaktifkan dan situs diakses lewat HTTPS."
          );
        }
      } finally {
        if (!cancelled) setStarting(false);
      }
    });

    return () => {
      cancelled = true;
      const instance = scannerRef.current;
      if (instance) {
        instance
          .stop()
          .then(() => instance.clear())
          .catch(() => {});
      }
    };
  }, [active, onResult]);

  return (
    <div className="overflow-hidden rounded-2xl border border-space-line bg-black/40">
      <div id={REGION_ID} className="aspect-square w-full" />
      {starting && (
        <p className="p-3 text-center text-xs text-ink-dim">Mengaktifkan kamera...</p>
      )}
      {error && <p className="p-3 text-center text-xs text-red-400">{error}</p>}
    </div>
  );
}
