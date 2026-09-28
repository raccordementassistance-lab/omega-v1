"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { J20_LABELS, J20_MESSAGES, J20_STATES, normalizeJ20, progressForJ20, type J20State } from "@/lib/j20/client";

type Address = { numero?: string | null; rue: string; codePostal: string; ville: string };
type ClientDossier = {
  id: string;
  numero: string | null;
  state?: string | null;
  status: string;
  createdAt: string;
  demandes?: Array<{ id: string; type: string; adresse?: Address | null }>;
};

function projectLabel(dossier: ClientDossier): string | null {
  const demande = dossier.demandes?.[0];
  return demande ? demande.type.replaceAll("_", " ") : null;
}

function addressLabel(dossier: ClientDossier): string | null {
  const adresse = dossier.demandes?.[0]?.adresse;
  if (!adresse) return null;
  return `${adresse.numero ? `${adresse.numero} ` : ""}${adresse.rue}, ${adresse.codePostal} ${adresse.ville}`;
}

function normalizeSearch(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function Badge({ status }: { status: string }) {
  const state = normalizeJ20(status);
  const label = state ? J20_LABELS[state] : status.replaceAll("_", " ");
  const tone = state === "TERMINE" ? "bg-success-soft text-success" : state === "ACTION_CLIENT" || state === "INFORMATIONS_MANQUANTES" ? "bg-warn-soft text-warn" : "bg-primary-soft text-ink";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>;
}

export default function ClientSpacePage() {
  const [dossiers, setDossiers] = React.useState<ClientDossier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<J20State | "TOUS">("TOUS");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/dossiers/mine", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body?.error?.message || "Connexion requise.");
      setDossiers((body.data || []) as ClientDossier[]);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Erreur");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    void load();
  }, []);

  async function createDossier() {
    setError("");
    const response = await fetch("/api/dossiers", { method: "POST" });
    const body = await response.json();
    if (!response.ok) {
      setError(body?.error?.message || "Impossible de créer le dossier.");
      return;
    }
    window.location.href = `/espace-client/dossiers/${body.data.id}`;
  }

  const filtered = React.useMemo(() => {
    const query = normalizeSearch(search.trim());
    return dossiers.filter((dossier) => {
      const state = normalizeJ20(dossier.state || dossier.status);
      if (statusFilter !== "TOUS" && state !== statusFilter) return false;
      if (!query) return true;
      const haystack = normalizeSearch(
        [dossier.numero ?? "", projectLabel(dossier) ?? "", addressLabel(dossier) ?? "", state ? J20_LABELS[state] : dossier.status].join(" ")
      );
      return haystack.includes(query);
    });
  }, [dossiers, search, statusFilter]);

  const hasAnyDossier = dossiers.length > 0;
  const hasResults = filtered.length > 0;

  return (
    <main>
      <section className="border-b border-line bg-bg-raised">
        <Container className="py-8 sm:py-12">
          <p className="text-sm font-semibold uppercase tracking-[.14em] text-accent">Raccordement Assistance</p>
          <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="font-serif text-3xl text-ink sm:text-4xl">Mon espace client</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
                Suivez vos demandes de raccordement électrique, vos documents et vos échanges avec Lydie.
              </p>
            </div>
            <button onClick={createDossier} className="rounded-m bg-accent px-4 py-3 text-sm font-bold text-accent-ink">
              + Nouveau dossier
            </button>
          </div>
        </Container>
      </section>

      <Container className="py-8">
        {error && <div className="mb-5 rounded-m border border-warn bg-warn-soft p-4 text-sm text-warn">{error}</div>}

        {hasAnyDossier && (
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label htmlFor="dossier-search" className="sr-only">
              Rechercher un dossier
            </label>
            <input
              id="dossier-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher par numéro, projet ou adresse…"
              className="w-full rounded-m border border-line bg-bg-raised px-4 py-2.5 text-sm text-ink outline-none focus:border-primary sm:max-w-sm"
            />
            <label htmlFor="dossier-status-filter" className="sr-only">
              Filtrer par statut
            </label>
            <select
              id="dossier-status-filter"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as J20State | "TOUS")}
              className="w-full rounded-m border border-line bg-bg-raised px-4 py-2.5 text-sm text-ink outline-none focus:border-primary sm:w-auto"
            >
              <option value="TOUS">Tous les statuts</option>
              {J20_STATES.map((item) => (
                <option key={item} value={item}>
                  {J20_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        )}

        {loading ? (
          <p className="text-sm text-muted">Chargement de vos dossiers…</p>
        ) : !hasAnyDossier ? (
          <div className="rounded-xl border border-line bg-bg-raised p-7">
            <h2 className="text-lg font-semibold">Aucun dossier</h2>
            <p className="mt-1 text-sm text-muted">Créez votre premier dossier pour commencer votre demande.</p>
          </div>
        ) : !hasResults ? (
          <div className="rounded-xl border border-line bg-bg-raised p-7">
            <h2 className="text-lg font-semibold">Aucun dossier ne correspond</h2>
            <p className="mt-1 text-sm text-muted">Essayez un autre numéro, projet, adresse ou statut.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtered.map((dossier) => {
              const state = normalizeJ20(dossier.state || dossier.status);
              const progress = state ? progressForJ20(state) : 0;
              const project = projectLabel(dossier);
              const address = addressLabel(dossier);
              return (
                <Link
                  key={dossier.id}
                  href={`/espace-client/dossiers/${dossier.id}`}
                  className="block rounded-xl border border-line bg-bg-raised p-5 transition hover:-translate-y-0.5 hover:shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted">Dossier</p>
                      <h2 className="mt-1 text-lg font-bold text-ink">{dossier.numero}</h2>
                      {project && <p className="mt-0.5 text-sm text-ink">{project}</p>}
                      {address && <p className="mt-0.5 text-xs text-muted">{address}</p>}
                    </div>
                    <Badge status={dossier.state || dossier.status} />
                  </div>
                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-primary-soft">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-3 text-sm text-muted">{state ? J20_MESSAGES[state] : "Votre dossier est suivi par notre équipe."}</p>
                  <p className="mt-4 text-xs text-muted">Créé le {new Date(dossier.createdAt).toLocaleDateString("fr-FR")}</p>
                </Link>
              );
            })}
          </div>
        )}
      </Container>
    </main>
  );
}
