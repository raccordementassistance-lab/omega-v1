"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";

type ConseillerDossier = { id: string; numero: string | null; status: string; client?: { prenom: string | null; nom: string | null } | null };

export default function ConseillerPage() {
  const [items, setItems] = React.useState<ConseillerDossier[]>([]);
  const [error, setError] = React.useState("");
  async function load() {
    const response = await fetch("/api/dossiers?pageSize=50");
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || "Accès refusé.");
    setItems((body.data || []) as ConseillerDossier[]);
  }
  React.useEffect(() => { void load().catch((caught: unknown) => setError(caught instanceof Error ? caught.message : "Erreur")); }, []);
  return <Container className="py-10"><p className="text-sm font-semibold uppercase tracking-wide text-accent">Espace conseiller</p><h1 className="mt-1 font-serif text-3xl text-ink">Dossiers</h1>{error && <div className="mt-6 rounded-m border border-warn bg-warn-soft p-4 text-warn">{error}</div>}<div className="mt-8 overflow-x-auto rounded-m border border-line bg-bg-raised"><table className="w-full text-left text-sm"><thead><tr className="border-b border-line"><th className="p-4">Dossier</th><th className="p-4">Client</th><th className="p-4">Statut</th></tr></thead><tbody>{items.map((dossier) => <tr key={dossier.id} className="border-b border-line last:border-0"><td className="p-4"><Link className="font-semibold text-primary underline" href={`/espace-client/dossiers/${dossier.id}`}>{dossier.numero}</Link></td><td className="p-4">{dossier.client?.prenom} {dossier.client?.nom}</td><td className="p-4">{dossier.status.replaceAll("_", " ")}</td></tr>)}</tbody></table></div></Container>;
}
