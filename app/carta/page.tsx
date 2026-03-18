"use client";

import { useEffect, useState } from "react";
import { Seccion, Plato } from "@/lib/types";
import Image from "next/image";

const PROJECT_ID = "yayu-fb3a9";
const API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY!;
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function parseDoc(doc: { name: string; fields: Record<string, { stringValue?: string; integerValue?: string; doubleValue?: number; booleanValue?: boolean }> }) {
  const id = doc.name.split("/").pop()!;
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(doc.fields ?? {})) {
    if ("stringValue" in v) data[k] = v.stringValue;
    else if ("integerValue" in v) data[k] = Number(v.integerValue);
    else if ("doubleValue" in v) data[k] = v.doubleValue;
    else if ("booleanValue" in v) data[k] = v.booleanValue;
  }
  return { id, ...data };
}

async function fetchCollection(name: string) {
  const res = await fetch(`${BASE}/${name}?key=${API_KEY}`);
  const json = await res.json();
  return (json.documents ?? []).map(parseDoc);
}

export default function CartaPage() {
  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);
  const [loading, setLoading] = useState(true);
  const [seccionActiva, setSeccionActiva] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCollection("secciones"), fetchCollection("platos")])
      .then(([secs, plats]) => {
        const sorted = (secs as Seccion[]).sort((a, b) => a.orden - b.orden);
        setSecciones(sorted);
        setPlatos(plats as Plato[]);
        if (sorted.length > 0) setSeccionActiva(sorted[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  const seccionActivaData = secciones.find((s) => s.id === seccionActiva);
  const platosFiltrados = platos.filter((p) => p.seccionId === seccionActiva && p.disponible);
  const tieneDoblesPrecios = platosFiltrados.some((p) => p.precio2);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "#f7f2e3" }}>
        <p className="text-sm tracking-widest uppercase" style={{ color: "#2d5a27" }}>Cargando carta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f2e3", color: "#1e4d2b" }}>

      {/* Header */}
      <header className="px-6 pt-7 pb-5 flex items-center gap-4">
        <div className="w-16 h-16 shrink-0 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#4a8c5c" }}>
          <Image
            src="/logo.png"
            alt="Yayuki logo"
            width={64}
            height={64}
            className="object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div>
          <h1
            className="leading-none uppercase"
            style={{
              color: "#f7f2e3",
              fontFamily: "var(--font-fredoka)",
              fontSize: "clamp(2.2rem, 9vw, 3.5rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              WebkitTextStroke: "10px #1e4d2b",
              paintOrder: "stroke fill",
            }}
          >
            YAYUKI
          </h1>
          <p className="text-xs tracking-[0.2em] uppercase" style={{ color: "#4a8c5c" }}>
            Sushi · Carta digital
          </p>
        </div>
      </header>

      {/* Navegación */}
      <div className="sticky top-0 z-10 border-b" style={{ backgroundColor: "#f7f2e3", borderColor: "#ddd5b8" }}>
        <nav className="overflow-x-auto scrollbar-none" style={{ WebkitOverflowScrolling: "touch" }}>
          <ul className="flex items-center px-2 min-w-max">
            {secciones.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => setSeccionActiva(s.id)}
                  className="px-3 py-3 text-sm tracking-wide transition-colors whitespace-nowrap border-b-2"
                  style={{
                    borderColor: seccionActiva === s.id ? "#e8961e" : "transparent",
                    color: seccionActiva === s.id ? "#e8961e" : "#1e4d2b",
                    fontWeight: seccionActiva === s.id ? 800 : 600,
                    opacity: seccionActiva === s.id ? 1 : 0.5,
                    fontSize: "clamp(0.75rem, 3vw, 0.875rem)",
                  }}
                >
                  {s.nombre}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Contenido */}
      <main className="max-w-lg mx-auto px-6 py-8">

        {/* Título de sección */}
        <div className="mb-6">
          <h2
            className="uppercase leading-none"
            style={{
              color: "#f7f2e3",
              fontFamily: "var(--font-fredoka)",
              fontSize: "clamp(3rem, 12vw, 5rem)",
              fontWeight: 700,
              letterSpacing: "0.02em",
              WebkitTextStroke: "12px #e8961e",
              paintOrder: "stroke fill",
            }}
          >
            {seccionActivaData?.nombre}
          </h2>
          {seccionActivaData?.subtitulo && (
            <p className="text-sm font-bold mt-1 tracking-wider uppercase" style={{ color: "#4a8c5c" }}>
              {seccionActivaData.subtitulo}
            </p>
          )}
        </div>

        {/* Cabecera doble precio */}
        {tieneDoblesPrecios && (
          <div className="flex justify-end mb-2 pb-2 border-b" style={{ borderColor: "#ddd5b8" }}>
            <div className="flex flex-col items-end gap-0.5">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#1e4d2b" }}>Nigiri x2</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: "#4a8c5c" }}>Sashimi x4</span>
            </div>
          </div>
        )}

        {/* Platos */}
        {platosFiltrados.length === 0 ? (
          <p className="text-sm opacity-50 py-10 text-center">No hay platos disponibles en esta sección.</p>
        ) : (
          <ul>
            {platosFiltrados.map((plato) => (
              <li key={plato.id} className="flex items-start justify-between gap-4 py-4 border-b" style={{ borderColor: "#ddd5b8" }}>
                <div className="flex-1">
                  <p className="font-bold text-base leading-snug" style={{ color: "#1e4d2b" }}>{plato.nombre}</p>
                  {plato.descripcion && (
                    <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#4a8c5c" }}>{plato.descripcion}</p>
                  )}
                </div>
                {plato.precio2 ? (
                  <div className="flex flex-col items-end shrink-0 gap-0.5 pt-0.5">
                    <span className="font-extrabold text-sm" style={{ color: "#1e4d2b" }}>{plato.precio.toFixed(2)}€</span>
                    <span className="font-extrabold text-sm" style={{ color: "#4a8c5c" }}>{plato.precio2.toFixed(2)}€</span>
                  </div>
                ) : (
                  <span className="font-extrabold text-base whitespace-nowrap pt-0.5 shrink-0" style={{ color: "#1e4d2b" }}>
                    {plato.precio.toFixed(2)}€
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      {/* Footer */}
      <footer className="py-10 text-center">
        <p className="text-xs tracking-widest uppercase opacity-40" style={{ color: "#1e4d2b" }}>
          Yayuki Sushi · Carta digital
        </p>
      </footer>
    </div>
  );
}
