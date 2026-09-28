"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";

export default function InscriptionPage() {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [form, setForm] = React.useState({ prenom: "", nom: "", email: "", password: "" });
  const [error, setError] = React.useState(""); const [loading, setLoading] = React.useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    const { data, error: authError } = await supabase.auth.signUp({ email: form.email, password: form.password, options: { data: { prenom: form.prenom, nom: form.nom } } });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    if (data.session) { router.push("/espace-client"); router.refresh(); return; }
    setError("Votre compte a été créé. Vérifiez votre e-mail pour confirmer votre adresse avant de vous connecter.");
  }
  return <Container className="max-w-lg py-12"><h1 className="font-serif text-3xl text-ink">Créer votre compte</h1><p className="mt-2 text-sm text-muted">Un compte vous permet de retrouver votre dossier et son suivi.</p><form onSubmit={submit} className="mt-8 space-y-4"><div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium">Prénom<input required value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})} className="mt-1 w-full rounded-m border border-line bg-bg-raised px-4 py-3" /></label><label className="block text-sm font-medium">Nom<input required value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})} className="mt-1 w-full rounded-m border border-line bg-bg-raised px-4 py-3" /></label></div><label className="block text-sm font-medium">E-mail<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} className="mt-1 w-full rounded-m border border-line bg-bg-raised px-4 py-3" /></label><label className="block text-sm font-medium">Mot de passe<input required minLength={8} type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} className="mt-1 w-full rounded-m border border-line bg-bg-raised px-4 py-3" /></label>{error && <p className="rounded-m border border-warn bg-warn-soft p-3 text-sm text-warn">{error}</p>}<button disabled={loading} className="w-full rounded-m bg-primary px-4 py-3 font-semibold text-primary-ink">{loading ? "Création…" : "Créer mon compte"}</button></form><p className="mt-6 text-sm text-muted">Déjà un compte ? <Link href="/connexion" className="font-semibold text-primary underline">Se connecter</Link></p></Container>;
}
