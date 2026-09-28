"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";

export default function ConnexionPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError("E-mail ou mot de passe incorrect."); return; }
    router.push("/espace-client"); router.refresh();
  }

  return <Container className="max-w-lg py-12"><h1 className="font-serif text-3xl text-ink">Se connecter</h1><p className="mt-2 text-sm text-muted">Accédez au suivi de vos dossiers.</p><form onSubmit={submit} className="mt-8 space-y-4"><label className="block text-sm font-medium">E-mail<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="mt-1 w-full rounded-m border border-line bg-bg-raised px-4 py-3" /></label><label className="block text-sm font-medium">Mot de passe<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} className="mt-1 w-full rounded-m border border-line bg-bg-raised px-4 py-3" /></label>{error && <p className="rounded-m border border-warn bg-warn-soft p-3 text-sm text-warn">{error}</p>}<button disabled={loading} className="w-full rounded-m bg-primary px-4 py-3 font-semibold text-primary-ink">{loading ? "Connexion…" : "Se connecter"}</button></form><p className="mt-6 text-sm text-muted">Pas encore de compte ? <Link href="/inscription" className="font-semibold text-primary underline">Créer un compte</Link></p></Container>;
}
