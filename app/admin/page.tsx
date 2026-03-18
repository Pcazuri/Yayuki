"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, query,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Seccion, Plato } from "@/lib/types";
import Image from "next/image";

// ─── Seed data ────────────────────────────────────────────────────────────────
const SECCIONES_SEED = [
  { nombre: "Otsumami",      subtitulo: "",                       orden: 0 },
  { nombre: "Hosomaki",      subtitulo: "8 piezas",               orden: 1 },
  { nombre: "Uramaki",       subtitulo: "8 piezas",               orden: 2 },
  { nombre: "Nigiri/Sashimi",subtitulo: "Nigiri x2 · Sashimi x4",orden: 3 },
  { nombre: "Combos",        subtitulo: "",                       orden: 4 },
  { nombre: "Postres",       subtitulo: "",                       orden: 5 },
  { nombre: "Bebidas",       subtitulo: "",                       orden: 6 },
];

const PLATOS_SEED: { seccion: string; nombre: string; descripcion: string; precio: number; precio2?: number }[] = [
  // Otsumami
  { seccion: "Otsumami", nombre: "Bol de arroz",    descripcion: "",                                                              precio: 3.50 },
  { seccion: "Otsumami", nombre: "Edamame Brasa",   descripcion: "",                                                              precio: 4.90 },
  { seccion: "Otsumami", nombre: "Gyozas de pollo", descripcion: "5 unidades",                                                    precio: 6.50 },
  { seccion: "Otsumami", nombre: "Takoyaki",         descripcion: "5 ud. · Buñuelo de pulpo",                                     precio: 5.50 },
  { seccion: "Otsumami", nombre: "Katsusando",       descripcion: "Sandwich de cerdo empanado",                                   precio: 6.30 },
  { seccion: "Otsumami", nombre: "Tataki atún",      descripcion: "Atún, sésamo, kizami",                                         precio: 8.90 },
  { seccion: "Otsumami", nombre: "Unagi poke",       descripcion: "Anguila, aguacate, huevo, sésamo, salsa de anguila y cebolleta", precio: 11.50 },
  // Hosomaki
  { seccion: "Hosomaki", nombre: "Kappa",   descripcion: "Pepino",    precio: 4.90 },
  { seccion: "Hosomaki", nombre: "Abokado", descripcion: "Aguacate",  precio: 4.90 },
  { seccion: "Hosomaki", nombre: "Takuan",  descripcion: "Daikon",    precio: 5.50 },
  { seccion: "Hosomaki", nombre: "Shake",   descripcion: "Salmón",    precio: 7.00 },
  { seccion: "Hosomaki", nombre: "Tekka",   descripcion: "Atún rojo", precio: 7.00 },
  // Uramaki
  { seccion: "Uramaki", nombre: "Spicy Shake",  descripcion: "Salmón, spicy mayo, aguacate",                                         precio: 10.90 },
  { seccion: "Uramaki", nombre: "Unagi",        descripcion: "Anguila, pepino, tortilla",                                            precio: 10.90 },
  { seccion: "Uramaki", nombre: "Maguro",       descripcion: "Atún, cebolleta, aguacate",                                            precio: 11.90 },
  { seccion: "Uramaki", nombre: "Ebi tempura",  descripcion: "Langostino frito, spicy mayo, aguacate",                               precio: 11.90 },
  { seccion: "Uramaki", nombre: "Futomaki",     descripcion: "6 pz. · Tortilla, pepino, aguacate, takuan, anguila, atún, pez limón", precio: 12.90 },
  // Nigiri/Sashimi
  { seccion: "Nigiri/Sashimi", nombre: "Shake",   descripcion: "Salmón",          precio: 5.50, precio2: 6.90 },
  { seccion: "Nigiri/Sashimi", nombre: "Hamachi", descripcion: "Pez limón",        precio: 5.50, precio2: 6.90 },
  { seccion: "Nigiri/Sashimi", nombre: "Akami",   descripcion: "Atún Rojo",        precio: 6.50, precio2: 7.90 },
  { seccion: "Nigiri/Sashimi", nombre: "Toro",    descripcion: "Ventresca",        precio: 6.50, precio2: 7.90 },
  { seccion: "Nigiri/Sashimi", nombre: "Gunkan",  descripcion: "Huevas o tartar",  precio: 6.50, precio2: 7.90 },
  { seccion: "Nigiri/Sashimi", nombre: "Wagyu",   descripcion: "Calidad A5",       precio: 8.50, precio2: 9.90 },
  // Combos
  { seccion: "Combos", nombre: "Bento BOX",    descripcion: "Para 1 · 14 piezas · 2 Gyozas",                  precio: 13.90 },
  { seccion: "Combos", nombre: "Kuren BOX",    descripcion: "Para 2 · 32 piezas · 1/2 Katsusando",            precio: 30.00 },
  { seccion: "Combos", nombre: "Oiwai no BOX", descripcion: "Para 4 · 60 piezas · 4 Gyozas · 1 Katsusando",  precio: 52.50 },
  // Postres
  { seccion: "Postres", nombre: "Mochi",     descripcion: "Preguntar, sabor según temporada",  precio: 1.90 },
  { seccion: "Postres", nombre: "Chota-san", descripcion: "Tarta cremosa de chocolate y miso", precio: 4.50 },
  { seccion: "Postres", nombre: "Midori",    descripcion: "Flan de pistacho y matcha",          precio: 4.50 },
  // Bebidas
  { seccion: "Bebidas", nombre: "Latas",                       descripcion: "Refrescos y cerveza",        precio: 1.50 },
  { seccion: "Bebidas", nombre: "Botellín",                    descripcion: "",                           precio: 1.20 },
  { seccion: "Bebidas", nombre: "Agua",                        descripcion: "500ml",                      precio: 2.30 },
  { seccion: "Bebidas", nombre: "La Chalada",                  descripcion: "D.O Rueda · Blanco Semidulce",precio: 14.00 },
  { seccion: "Bebidas", nombre: "Saturnino",                   descripcion: "D.O Rueda · Blanco Verdejo",  precio: 16.00 },
  { seccion: "Bebidas", nombre: "Manzanilla Papirusa Lustau",  descripcion: "D.O Sanlúcar",               precio: 16.00 },
  { seccion: "Bebidas", nombre: "Manzanilla Aurora Yuste",     descripcion: "D.O Sanlúcar · 500ml",       precio: 14.00 },
  { seccion: "Bebidas", nombre: "Amontillado 1822 Argüeso",    descripcion: "D.O Jerez",                  precio: 18.00 },
  { seccion: "Bebidas", nombre: "Champagne JP Chenet",         descripcion: "Blanc de blancs",            precio: 18.00 },
];

type PlatoForm = Omit<Plato, "id">;
const FORM_VACIO = (seccionId: string): PlatoForm => ({
  nombre: "", descripcion: "", precio: 0, precio2: undefined, seccionId, disponible: true,
});

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [secciones, setSecciones] = useState<Seccion[]>([]);
  const [platos, setPlatos] = useState<Plato[]>([]);

  const [modalSeccionId, setModalSeccionId] = useState<string | null>(null);
  const [editandoPlato, setEditandoPlato] = useState<string | null>(null);
  const [platoForm, setPlatoForm] = useState<PlatoForm>(FORM_VACIO(""));
  const [guardando, setGuardando] = useState(false);

  const [modalSecciones, setModalSecciones] = useState(false);
  const [nuevaSeccion, setNuevaSeccion] = useState("");
  const [poblando, setPoblando] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  async function fetchData() {
    const secSnap = await getDocs(query(collection(db, "secciones"), orderBy("orden")));
    const platSnap = await getDocs(collection(db, "platos"));
    setSecciones(secSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Seccion)));
    setPlatos(platSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Plato)));
  }

  async function poblarCarta() {
    setPoblando(true);
    try {
      // Borrar existentes en paralelo
      const [secSnap, platSnap] = await Promise.all([
        getDocs(collection(db, "secciones")),
        getDocs(collection(db, "platos")),
      ]);
      await Promise.all([
        ...secSnap.docs.map((d) => deleteDoc(doc(db, "secciones", d.id))),
        ...platSnap.docs.map((d) => deleteDoc(doc(db, "platos", d.id))),
      ]);

      // Crear secciones en paralelo
      const refs = await Promise.all(
        SECCIONES_SEED.map((s) => addDoc(collection(db, "secciones"), s))
      );
      const seccionIds: Record<string, string> = {};
      SECCIONES_SEED.forEach((s, i) => { seccionIds[s.nombre] = refs[i].id; });

      // Crear platos en paralelo
      await Promise.all(
        PLATOS_SEED.map((p) => {
          const seccionId = seccionIds[p.seccion];
          if (!seccionId) return Promise.resolve();
          return addDoc(collection(db, "platos"), {
            nombre: p.nombre,
            descripcion: p.descripcion,
            precio: p.precio,
            ...(p.precio2 ? { precio2: p.precio2 } : {}),
            seccionId,
            disponible: true,
          });
        })
      );
    } catch (err) {
      console.error("Error poblando carta:", err);
      alert("Error al poblar la carta. Revisa la consola.");
    } finally {
      setPoblando(false);
      fetchData();
    }
  }

  async function crearSeccion() {
    if (!nuevaSeccion.trim()) return;
    await addDoc(collection(db, "secciones"), { nombre: nuevaSeccion.trim(), orden: secciones.length, subtitulo: "" });
    setNuevaSeccion("");
    fetchData();
  }

  async function eliminarSeccion(id: string) {
    await deleteDoc(doc(db, "secciones", id));
    fetchData();
  }

  function abrirModalNuevo(seccionId: string) {
    setEditandoPlato(null);
    setPlatoForm(FORM_VACIO(seccionId));
    setModalSeccionId(seccionId);
  }

  function abrirModalEditar(plato: Plato) {
    setEditandoPlato(plato.id);
    setPlatoForm({ nombre: plato.nombre, descripcion: plato.descripcion, precio: plato.precio, precio2: plato.precio2, seccionId: plato.seccionId, disponible: plato.disponible });
    setModalSeccionId(plato.seccionId);
  }

  function cerrarModal() {
    setModalSeccionId(null);
    setEditandoPlato(null);
    setPlatoForm(FORM_VACIO(""));
  }

  async function guardarPlato() {
    if (!platoForm.nombre.trim() || !platoForm.seccionId) return;
    setGuardando(true);
    const data = {
      nombre: platoForm.nombre,
      descripcion: platoForm.descripcion,
      precio: platoForm.precio,
      seccionId: platoForm.seccionId,
      disponible: platoForm.disponible,
      ...(platoForm.precio2 ? { precio2: platoForm.precio2 } : {}),
    };
    if (editandoPlato) {
      await updateDoc(doc(db, "platos", editandoPlato), data);
    } else {
      await addDoc(collection(db, "platos"), data);
    }
    setGuardando(false);
    cerrarModal();
    fetchData();
  }

  async function eliminarPlato(id: string) {
    await deleteDoc(doc(db, "platos", id));
    fetchData();
  }

  async function toggleDisponible(plato: Plato) {
    await updateDoc(doc(db, "platos", plato.id), { disponible: !plato.disponible });
    fetchData();
  }

  if (loading || !user) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f7f2e3", color: "#1e4d2b" }}>

      {/* Header */}
      <header className="px-6 py-4 flex items-center justify-between border-b sticky top-0 z-10" style={{ backgroundColor: "#f7f2e3", borderColor: "#ddd5b8" }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center" style={{ backgroundColor: "#4a8c5c" }}>
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="object-cover" />
          </div>
          <div>
            <h1 className="leading-none uppercase" style={{ color: "#f7f2e3", fontFamily: "var(--font-fredoka)", fontSize: "1.4rem", fontWeight: 700, WebkitTextStroke: "6px #1e4d2b", paintOrder: "stroke fill" }}>YAYUKI</h1>
            <p className="text-xs tracking-widest uppercase" style={{ color: "#4a8c5c" }}>Administración</p>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <a href="/admin/qr" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "#1e4d2b" }}>
            QR
          </a>
          <button onClick={() => setModalSecciones(true)} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "#1e4d2b" }}>
            Secciones
          </button>
          <a href="/carta" target="_blank" className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "#4a8c5c" }}>
            Ver carta →
          </a>
          <button onClick={() => signOut(auth)} className="text-sm font-semibold hover:opacity-70 transition-opacity" style={{ color: "#1e4d2b" }}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-10">

        {secciones.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-sm mb-6" style={{ color: "#4a8c5c" }}>La carta está vacía.</p>
            <button
              onClick={poblarCarta}
              disabled={poblando}
              className="rounded-full px-8 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ backgroundColor: "#1e4d2b" }}
            >
              {poblando ? "Poblando carta..." : "Poblar carta completa"}
            </button>
          </div>
        ) : (
          <>
            {/* Botón poblar (si ya hay contenido, como opción de reset) */}
            <div className="flex justify-end">
              <button
                onClick={() => { if (confirm("Esto borrará todo el contenido actual y lo reemplazará. ¿Continuar?")) poblarCarta(); }}
                disabled={poblando}
                className="text-xs font-semibold hover:opacity-60 transition-opacity"
                style={{ color: "#4a8c5c" }}
              >
                {poblando ? "Restaurando..." : "↺ Restaurar carta original"}
              </button>
            </div>

            {secciones.map((seccion) => {
              const platosSeccion = platos.filter((p) => p.seccionId === seccion.id);
              return (
                <div key={seccion.id}>
                  <div className="flex items-end justify-between mb-1">
                    <div>
                      <h2
                        className="uppercase leading-none"
                        style={{ color: "#f7f2e3", fontFamily: "var(--font-fredoka)", fontSize: "clamp(2rem, 8vw, 3rem)", fontWeight: 700, letterSpacing: "0.02em", WebkitTextStroke: "10px #e8961e", paintOrder: "stroke fill" }}
                      >
                        {seccion.nombre}
                      </h2>
                      {seccion.subtitulo && (
                        <p className="text-xs font-semibold mt-1" style={{ color: "#4a8c5c" }}>{seccion.subtitulo}</p>
                      )}
                    </div>
                    <button
                      onClick={() => abrirModalNuevo(seccion.id)}
                      className="rounded-full px-4 py-1.5 text-xs font-bold text-white transition-opacity hover:opacity-80 mb-1"
                      style={{ backgroundColor: "#1e4d2b" }}
                    >
                      + Añadir plato
                    </button>
                  </div>

                  {platosSeccion.length === 0 ? (
                    <p className="text-sm opacity-40 py-4 border-t" style={{ borderColor: "#ddd5b8" }}>Sin platos.</p>
                  ) : (
                    <ul>
                      {platosSeccion.map((plato) => (
                        <li key={plato.id} className="flex items-start justify-between gap-4 py-3 border-t" style={{ borderColor: "#ddd5b8" }}>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-sm" style={{ color: "#1e4d2b", opacity: plato.disponible ? 1 : 0.4 }}>
                                {plato.nombre}
                              </p>
                              {!plato.disponible && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: "#ddd5b8", color: "#4a8c5c" }}>
                                  Oculto
                                </span>
                              )}
                            </div>
                            {plato.descripcion && (
                              <p className="text-xs mt-0.5" style={{ color: "#4a8c5c", opacity: plato.disponible ? 1 : 0.4 }}>
                                {plato.descripcion}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 pt-0.5 shrink-0">
                            <span className="font-extrabold text-sm" style={{ color: "#1e4d2b" }}>
                              {plato.precio.toFixed(2)}€{plato.precio2 ? ` / ${plato.precio2.toFixed(2)}€` : ""}
                            </span>
                            <div className="flex gap-3">
                              <button onClick={() => toggleDisponible(plato)} className="text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color: "#4a8c5c" }}>
                                {plato.disponible ? "Ocultar" : "Mostrar"}
                              </button>
                              <button onClick={() => abrirModalEditar(plato)} className="text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color: "#1e4d2b" }}>
                                Editar
                              </button>
                              <button onClick={() => eliminarPlato(plato.id)} className="text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color: "#c0392b" }}>
                                Eliminar
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </>
        )}
      </main>

      {/* Modal plato */}
      {modalSeccionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={(e) => { if (e.target === e.currentTarget) cerrarModal(); }}>
          <div className="w-full max-w-md rounded-2xl p-6 shadow-xl" style={{ backgroundColor: "#f7f2e3" }}>
            <h3 className="uppercase mb-5" style={{ color: "#e8961e", fontFamily: "var(--font-fredoka)", fontSize: "1.8rem", fontWeight: 700 }}>
              {editandoPlato ? "Editar plato" : "Añadir plato"}
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <input
                  value={platoForm.nombre}
                  onChange={(e) => setPlatoForm({ ...platoForm, nombre: e.target.value })}
                  placeholder="Nombre del plato"
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border"
                  style={{ backgroundColor: "white", borderColor: "#ddd5b8", color: "#1e4d2b" }}
                />
                <input
                  type="number"
                  value={platoForm.precio || ""}
                  onChange={(e) => setPlatoForm({ ...platoForm, precio: Number(e.target.value) })}
                  placeholder="Precio"
                  className="w-24 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border"
                  style={{ backgroundColor: "white", borderColor: "#ddd5b8", color: "#1e4d2b" }}
                />
              </div>
              <textarea
                value={platoForm.descripcion}
                onChange={(e) => setPlatoForm({ ...platoForm, descripcion: e.target.value })}
                placeholder="Descripción (opcional)"
                rows={2}
                className="rounded-xl px-4 py-2.5 text-sm outline-none border resize-none"
                style={{ backgroundColor: "white", borderColor: "#ddd5b8", color: "#1e4d2b" }}
              />
              <div className="flex gap-3">
                <select
                  value={platoForm.seccionId}
                  onChange={(e) => setPlatoForm({ ...platoForm, seccionId: e.target.value })}
                  className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border"
                  style={{ backgroundColor: "white", borderColor: "#ddd5b8", color: "#1e4d2b" }}
                >
                  {secciones.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select>
                <input
                  type="number"
                  value={platoForm.precio2 || ""}
                  onChange={(e) => setPlatoForm({ ...platoForm, precio2: e.target.value ? Number(e.target.value) : undefined })}
                  placeholder="2º precio"
                  className="w-28 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border"
                  style={{ backgroundColor: "white", borderColor: "#ddd5b8", color: "#1e4d2b" }}
                />
              </div>
              <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer" style={{ color: "#1e4d2b" }}>
                <input type="checkbox" checked={platoForm.disponible} onChange={(e) => setPlatoForm({ ...platoForm, disponible: e.target.checked })} />
                Disponible en carta
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={guardarPlato} disabled={guardando} className="flex-1 rounded-full py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50" style={{ backgroundColor: "#1e4d2b" }}>
                  {guardando ? "Guardando..." : editandoPlato ? "Guardar cambios" : "Añadir plato"}
                </button>
                <button onClick={cerrarModal} className="rounded-full px-5 py-2.5 text-sm font-bold border transition-opacity hover:opacity-60" style={{ borderColor: "#ddd5b8", color: "#1e4d2b" }}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal secciones */}
      {modalSecciones && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} onClick={(e) => { if (e.target === e.currentTarget) setModalSecciones(false); }}>
          <div className="w-full max-w-sm rounded-2xl p-6 shadow-xl" style={{ backgroundColor: "#f7f2e3" }}>
            <h3 className="uppercase mb-5" style={{ color: "#e8961e", fontFamily: "var(--font-fredoka)", fontSize: "1.8rem", fontWeight: 700 }}>Secciones</h3>
            <ul className="mb-4">
              {secciones.map((s) => (
                <li key={s.id} className="flex items-center justify-between py-2.5 border-b" style={{ borderColor: "#ddd5b8" }}>
                  <div>
                    <span className="text-sm font-semibold" style={{ color: "#1e4d2b" }}>{s.nombre}</span>
                    {s.subtitulo && <span className="text-xs ml-2" style={{ color: "#4a8c5c" }}>{s.subtitulo}</span>}
                  </div>
                  <button onClick={() => eliminarSeccion(s.id)} className="text-xs font-semibold hover:opacity-60 transition-opacity" style={{ color: "#c0392b" }}>
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <input
                value={nuevaSeccion}
                onChange={(e) => setNuevaSeccion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && crearSeccion()}
                placeholder="Nueva sección"
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none border"
                style={{ backgroundColor: "white", borderColor: "#ddd5b8", color: "#1e4d2b" }}
              />
              <button onClick={crearSeccion} className="rounded-full px-4 py-2.5 text-sm font-bold text-white hover:opacity-80 transition-opacity" style={{ backgroundColor: "#1e4d2b" }}>
                Añadir
              </button>
            </div>
            <button onClick={() => setModalSecciones(false)} className="mt-4 w-full rounded-full py-2.5 text-sm font-bold border hover:opacity-60 transition-opacity" style={{ borderColor: "#ddd5b8", color: "#1e4d2b" }}>
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
