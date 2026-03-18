"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/admin");
    } catch {
      setError("Correo o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="uppercase" style={{ fontFamily: "var(--font-fredoka)", fontSize: "2.5rem", fontWeight: 700, color: "#f7f2e3", WebkitTextStroke: "10px #1e4d2b", paintOrder: "stroke fill" }}>YAYUKI</h1>
          <p className="mt-1 text-xs tracking-widest text-zinc-400 uppercase">Administración</p>
        </div>
        <div className="rounded-2xl bg-white border border-zinc-200 p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="rounded-lg border border-zinc-200 px-3 py-2.5 text-sm outline-none focus:border-zinc-400 transition-colors"
              />
            </div>
            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-full bg-zinc-900 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Entrando..." : "Acceder"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
