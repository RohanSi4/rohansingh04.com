"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("wrong password");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-sm px-4">
      <p className="font-mono text-xs text-muted mb-6 uppercase tracking-widest">admin</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        autoFocus
        className="w-full bg-surface border border-border rounded px-3 py-2 text-sm font-mono focus:outline-none focus:border-accent"
      />
      {error && <p className="text-xs text-red-400 mt-2 font-mono">{error}</p>}
      <button
        type="submit"
        disabled={loading || !password}
        className="mt-4 w-full bg-accent text-bg text-sm font-mono py-2 rounded hover:opacity-90 transition-opacity disabled:opacity-40"
      >
        {loading ? "..." : "enter"}
      </button>
    </form>
  );
}
