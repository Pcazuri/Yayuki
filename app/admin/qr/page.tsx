"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { QRCodeSVG } from "qrcode.react";

export default function QRPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [url, setUrl] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    setUrl(`${window.location.origin}/carta`);
  }, []);

  function imprimir() {
    window.print();
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: "#f7f2e3" }}>

      {/* Botón volver — oculto al imprimir */}
      <div className="w-full max-w-sm mb-8 print:hidden">
        <button
          onClick={() => router.push("/admin")}
          className="text-sm font-semibold hover:opacity-70 transition-opacity"
          style={{ color: "#4a8c5c" }}
        >
          ← Volver al panel
        </button>
      </div>

      {/* Tarjeta QR */}
      <div
        className="w-full max-w-sm rounded-3xl p-8 flex flex-col items-center gap-6 shadow-sm"
        style={{ backgroundColor: "white" }}
        id="qr-card"
      >
        {/* Logo + nombre */}
        <div className="flex flex-col items-center gap-1">
          <h1
            className="uppercase leading-none"
            style={{
              fontFamily: "var(--font-fredoka)",
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "#f7f2e3",
              WebkitTextStroke: "8px #1e4d2b",
              paintOrder: "stroke fill",
            }}
          >
            YAYUKI
          </h1>
          <p className="text-xs tracking-widest uppercase" style={{ color: "#4a8c5c" }}>
            Sushi · Carta digital
          </p>
        </div>

        {/* QR */}
        {url && (
          <div className="p-4 rounded-2xl" style={{ backgroundColor: "#f7f2e3" }}>
            <QRCodeSVG
              value={url}
              size={200}
              bgColor="#f7f2e3"
              fgColor="#1e4d2b"
              level="M"
            />
          </div>
        )}

        {/* Texto */}
        <div className="text-center flex flex-col gap-1">
          <p className="font-bold text-base" style={{ color: "#1e4d2b" }}>
            Escanea para ver la carta
          </p>
          <p className="text-xs break-all" style={{ color: "#4a8c5c" }}>
            {url}
          </p>
        </div>

        {/* Franja decorativa */}
        <div className="w-full h-1 rounded-full" style={{ backgroundColor: "#e8961e" }} />
      </div>

      {/* Botón imprimir — oculto al imprimir */}
      <div className="mt-8 print:hidden">
        <button
          onClick={imprimir}
          className="rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#1e4d2b" }}
        >
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* CSS de impresión */}
      <style>{`
        @media print {
          body { background: white; }
          @page { margin: 0; size: A5; }
        }
      `}</style>
    </div>
  );
}
