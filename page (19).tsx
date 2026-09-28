"use client";
import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { J20_LABELS, J20_MESSAGES, J20_STATES, normalizeJ20, progressForJ20 } from "@/lib/j20/client";
import { deriveReseaux, type ReseauDisplayStatus } from "@/lib/j20/reseaux";

type Address = { numero?: string | null; rue: string; codePostal: string; ville: string };
type Dossier = { numero: string | null; state?: string | null; status?: string | null; demandes?: Array<{ id: string; type: string; adresse?: Address | null }>; documents?: Array<{ id: string; name: string; status: string }> };
type Message = { id: string; role: "CLIENT" | "LYDIE" | "CONSEILLER"; content: string };
type Event = { id: string; label: string; createdAt: string };
type ApiError = { error?: { message?: string } };

function messageOf(error: unknown, fallback: string) { return error instanceof Error ? error.message : fallback; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <section className="rounded-xl border border-line bg-bg-raised p-5 sm:p-6"><h2 className="font-semibold text-ink">{title}</h2>{children}</section>; }

// Vue dérivée « Réseaux » (mission P3.2) : purement une classe CSS par
// statut d'affichage, aucune donnée — voir src/lib/j20/reseaux.ts pour la
// dérivation elle-même (fonction pure, sans Prisma).
const RESEAU_STATUS_TONE: Record<ReseauDisplayStatus, string> = {
  A_PREPARER: "bg-primary-soft text-ink",
  EN_COURS: "bg-primary-soft text-ink",
  ACTION_REQUISE: "bg-warn-soft text-warn",
  TERMINE: "bg-success-soft text-success",
  A_DETERMINER: "bg-line/40 text-muted",
  NON_CONCERNE: "bg-line/40 text-muted",
};

export default function DossierPage() {
  const { id } = useParams<{ id: string }>();
  const [dossier, setDossier] = React.useState<Dossier | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [timeline, setTimeline] = React.useState<Event[]>([]);
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const load = React.useCallback(async () => {
    const [dossierResponse, messagesResponse, timelineResponse] = await Promise.all([fetch(`/api/dossiers/${id}`, { cache: "no-store" }), fetch(`/api/dossiers/${id}/messages`, { cache: "no-store" }), fetch(`/api/dossiers/${id}/timeline`, { cache: "no-store" })]);
    const [dossierBody, messagesBody, timelineBody] = await Promise.all([dossierResponse.json() as Promise<ApiError & { data?: unknown }>, messagesResponse.json() as Promise<ApiError & { data?: unknown }>, timelineResponse.json() as Promise<ApiError & { data?: unknown }>]);
    if (!dossierResponse.ok) throw new Error(dossierBody.error?.message || "Dossier introuvable.");
    setDossier(dossierBody.data as Dossier); if (messagesResponse.ok) setMessages((messagesBody.data || []) as Message[]); if (timelineResponse.ok) setTimeline((timelineBody.data || []) as Event[]);
  }, [id]);
  React.useEffect(() => { if (id) void load().catch((caught: unknown) => setError(messageOf(caught, "Erreur"))); }, [id, load]);
  async function send() { const value = text.trim(); if (!value || sending) return; setSending(true); setText(""); try { const response = await fetch("/api/lydie", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ dossierId: id, message: value, history: messages.slice(-30).map((item) => ({ role: item.role === "CLIENT" ? "user" : "assistant", content: item.content })) }) }); const body = await response.json(); if (!response.ok) throw new Error(body?.error?.message || "Impossible d'envoyer le message."); await load(); } catch (caught: unknown) { setError(messageOf(caught, "Erreur")); } finally { setSending(false); } }
  if (error && !dossier) return <Container className="py-10"><div className="rounded-m border border-warn bg-warn-soft p-5 text-warn">{error}</div></Container>;
  if (!dossier) return <Container className="py-10"><p className="text-sm text-muted">Chargement du dossier…</p></Container>;
  const state = normalizeJ20(dossier.state || dossier.status || "") || "NOUVEAU"; const progress = progressForJ20(state); const closed = state === "TERMINE" || state === "ARCHIVE_INACTIF"; const activeIndex = J20_STATES.indexOf(state);
  const reseaux = deriveReseaux((dossier.demandes?.length ?? 0) > 0, state);
  return <main><Container className="py-6 sm:py-10"><Link href="/espace-client" className="text-sm font-semibold text-primary underline">← Mes dossiers</Link><div className="mt-5 rounded-xl border border-line bg-bg-raised p-5 sm:p-7"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-semibold uppercase tracking-[.14em] text-accent">Pluri Raccordé® · Dossier {dossier.numero}</p><h1 className="mt-1 font-serif text-3xl text-ink">Suivi de votre raccordement</h1><p className="mt-2 max-w-2xl text-sm text-muted">{J20_MESSAGES[state]}</p></div><span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-ink">{J20_LABELS[state]}</span></div><div className="mt-6"><div className="flex justify-between text-xs font-semibold text-muted"><span>Avancement</span><span>{progress}%</span></div><div className="mt-2 h-2.5 overflow-hidden rounded-full bg-primary-soft"><div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} /></div></div></div>{error && <div className="mt-4 rounded-m border border-warn bg-warn-soft p-4 text-sm text-warn">{error}</div>}
  <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><div className="space-y-6"><Section title="Votre projet">{dossier.demandes?.length ? dossier.demandes.map((demande) => <div key={demande.id} className="mt-4 rounded-lg border border-line p-4"><p className="font-semibold text-ink">{demande.type.replaceAll("_", " ")}</p>{demande.adresse && <p className="mt-1 text-sm text-muted">{demande.adresse.numero ? `${demande.adresse.numero} ` : ""}{demande.adresse.rue}, {demande.adresse.codePostal} {demande.adresse.ville}</p>}</div>) : <p className="mt-3 text-sm text-muted">Les informations de votre projet apparaîtront ici.</p>}</Section><Section title="Réseaux"><p className="mt-1 text-xs text-muted">Pluri Raccordé® prépare vos démarches réseau par réseau.</p><div className="mt-4 space-y-2.5">{reseaux.map((reseau) => <div key={reseau.key} className="flex items-center justify-between rounded-lg border border-line p-3"><span className="flex items-center gap-2 text-sm text-ink"><span aria-hidden="true">{reseau.icon}</span>{reseau.label}</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${RESEAU_STATUS_TONE[reseau.status]}`}>{reseau.statusLabel}</span></div>)}</div></Section><Section title="Documents">{dossier.documents?.length ? dossier.documents.map((document) => <div key={document.id} className="mt-3 rounded-lg border border-line p-4"><p className="font-medium text-ink">{document.name}</p><p className="mt-1 text-xs text-muted">{document.status.replaceAll("_", " ")}</p>{!closed && !["RECU", "VALIDE", "NON_NECESSAIRE"].includes(document.status) && <p className="mt-3 text-xs text-muted">Pour transmettre cette pièce, utilisez l&apos;e-mail indiqué par Raccordement Assistance. Aucun dépôt de fichier n&apos;est effectué directement ici.</p>}</div>) : <p className="mt-3 text-sm text-muted">Aucun document demandé pour le moment.</p>}</Section><Section title="Parcours du dossier"><div className="mt-5 space-y-3">{J20_STATES.map((item, index) => <div key={item} className={`flex items-center gap-3 ${index > activeIndex ? "opacity-40" : ""}`}><div className={`h-3 w-3 rounded-full ${index <= activeIndex ? "bg-accent" : "bg-line"}`} /><p className="text-sm text-ink">{J20_LABELS[item]}</p></div>)}</div></Section></div><div className="space-y-6"><Section title="Historique"><div className="mt-4 space-y-4">{timeline.length ? timeline.slice().reverse().map((event) => <div key={event.id} className="border-l-2 border-line pl-4"><p className="text-sm font-medium text-ink">{event.label}</p><p className="mt-1 text-xs text-muted">{new Date(event.createdAt).toLocaleString("fr-FR")}</p></div>) : <p className="text-sm text-muted">L&apos;historique apparaîtra ici au fur et à mesure.</p>}</div></Section><Section title="Parler à Lydie"><div className="mt-4 max-h-[420px] space-y-3 overflow-y-auto">{messages.length ? messages.map((item) => <div key={item.id} className={`rounded-lg p-3 text-sm ${item.role === "CLIENT" ? "ml-6 bg-primary text-primary-ink" : "mr-6 bg-primary-soft text-ink"}`}>{item.content}</div>) : <p className="text-sm text-muted">Posez votre question à Lydie.</p>}</div><div className="mt-4 flex gap-2"><input value={text} disabled={sending || closed} onChange={(event) => setText(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void send(); }} className="min-w-0 flex-1 rounded-m border border-line bg-bg px-4 py-3 text-sm" placeholder={closed ? "Conversation inactive" : "Écrire à Lydie…"} /><button disabled={sending || closed} onClick={() => void send()} className="rounded-m bg-accent px-4 py-3 text-sm font-bold text-accent-ink">{sending ? "…" : "Envoyer"}</button></div></Section></div></div></Container></main>;
}
