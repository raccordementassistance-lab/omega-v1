"use client";

import * as React from "react";
import Link from "next/link";
import { Send, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { INITIAL_LYDIE_CONTEXT, type LydieContext } from "@/lib/lydie/engine";
import { EntryScreen } from "@/components/lydie/EntryScreen";
import { ConversationShell } from "@/components/lydie/ConversationShell";
import { LYDIE_PROJECT_CARDS, LYDIE_DONT_KNOW_MESSAGE } from "@/components/lydie/presets";
import type { AddressSuggestion, AddressSuggestionSource } from "@/lib/lydie/addressSuggestions";

interface ChatMessage {
  id: string;
  role: "assistant" | "user" | "system";
  content: string;
}

const initialMessages: ChatMessage[] = [
  {
    id: "intro",
    role: "assistant",
    content: "Bonjour 👋 Je suis Lydie. Vous préférez parler ou écrire ?",
  },
];

type LydieApiResponse = {
  reply?: string;
  context?: LydieContext;
  step?: LydieContext["step"];
  dossier?: { id: string; numero: string | null } | null;
  requiresAuth?: boolean;
  error?: { message?: string };
};

type PersistedChatState = {
  messages: ChatMessage[];
  context: LydieContext;
  dossier: { id: string; numero: string | null } | null;
};

/**
 * Persistance locale de la conversation, pour survivre à un rafraîchissement
 * de page ou une fermeture d'onglet AVANT la création du dossier (tant qu'il
 * n'y a pas encore de dossier, rien n'est en base côté serveur pour
 * reprendre la conversation — voir la discussion produit sur ce point).
 *
 * Limite assumée : ceci ne survit que sur le même navigateur/appareil, pas
 * en cas de navigation privée ou de stockage local vidé, et ne remplace pas
 * une vraie reprise multi-appareils (qui nécessiterait un brouillon côté
 * serveur, non fait dans cette livraison).
 */
const STORAGE_KEY = "lydie:chat-state:v1";

function loadPersistedState(): PersistedChatState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedChatState>;
    if (!parsed || !Array.isArray(parsed.messages) || !parsed.context) return null;
    return { messages: parsed.messages, context: parsed.context, dossier: parsed.dossier ?? null };
  } catch {
    return null;
  }
}

function persistState(state: PersistedChatState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Stockage indisponible (navigation privée, quota dépassé...) : on
    // continue sans persister, jamais une erreur bloquante pour le chat.
  }
}

function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Rien à faire : au pire la prochaine visite relira un état obsolète.
  }
}

/**
 * Interface de conversation avec Lydie.
 *
 * Lydie est reliée à un moteur conversationnel serveur déterministe, à
 * contexte structuré (MODE → PROJECT → ADDRESS → DETAILS → DOCUMENTS →
 * SUMMARY → DONE). Le contexte est conservé côté client entre deux messages
 * et renvoyé à chaque appel : c'est l'API qui reste la seule source de
 * vérité sur la progression du parcours et sur la création du dossier.
 *
 * Passe UI du 27/09/2026 : cette page distingue maintenant deux écrans —
 * un écran d'entrée/orientation (EntryScreen, référence "capture 2") tant
 * qu'aucun message n'a été envoyé par le client, puis l'espace de
 * conversation à 3 colonnes (ConversationShell, référence "capture 1") dès
 * le premier message. Les deux ne sont que deux affichages du même état
 * (`messages` / `context` / `dossier` ci-dessous, inchangés) — aucune
 * nouvelle architecture, aucun nouvel appel API, aucune nouvelle logique
 * métier n'a été introduite par cette passe.
 */
export default function ChatPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>(() => loadPersistedState()?.messages ?? initialMessages);
  const [context, setContext] = React.useState<LydieContext>(() => loadPersistedState()?.context ?? INITIAL_LYDIE_CONTEXT);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [backendUnavailable, setBackendUnavailable] = React.useState(false);
  const [requiresAuth, setRequiresAuth] = React.useState(false);
  const [dossier, setDossier] = React.useState<{ id: string; numero: string | null } | null>(() => loadPersistedState()?.dossier ?? null);
  const listEndRef = React.useRef<HTMLDivElement>(null);

  // Mission P3.3 (Dossier Vivant) : mémorise, une seule fois, si cette
  // session de navigateur avait déjà un état persistant AU CHARGEMENT de la
  // page. `false` signifie « premier passage sur ce navigateur, aucune
  // trace locale » — c'est uniquement dans ce cas que le tout premier
  // message envoyé n'embarque volontairement aucun `context` (voir send()
  // ci-dessous), pour laisser le serveur décider s'il doit reprendre un
  // dossier déjà existant du client authentifié plutôt que de tout
  // redemander (voir route.ts). Une fois le premier échange terminé, le
  // `context` réel (qu'il vienne d'un dossier repris ou d'un vrai départ à
  // zéro) est toujours envoyé normalement — ce drapeau ne sert plus après.
  const hadPersistedStateOnLoad = React.useRef(loadPersistedState() !== null);

  // --- Suggestions d'adresse (BAN) — Bloc A, mission P2B.0 ------------------
  // Enrichissement purement UI, jamais transmis à stepLydie() comme si le
  // client l'avait tapé lui-même : une suggestion sélectionnée est envoyée
  // via `send()`, exactement comme un message tapé à la main — voir
  // BAN-INTEGRATION-PLAN.md §1 et §7 (« sélection propre »). Aucun appel
  // direct à la BAN depuis ce composant : tout passe par
  // /api/lydie/adresse-suggestions (voir ce fichier pour la justification).
  const [addressSuggestions, setAddressSuggestions] = React.useState<AddressSuggestion[]>([]);
  const [addressSuggestionsSource, setAddressSuggestionsSource] = React.useState<AddressSuggestionSource | null>(null);
  const [addressSuggestionsLoading, setAddressSuggestionsLoading] = React.useState(false);

  React.useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  React.useEffect(() => {
    persistState({ messages, context, dossier });
  }, [messages, context, dossier]);

  // Debounce (300 ms, voir BAN-INTEGRATION-PLAN.md §8) : n'interroge
  // /api/lydie/adresse-suggestions qu'après une pause de saisie, jamais à
  // chaque frappe — protège le service public BAN d'un usage excessif.
  // N'agit que pendant l'étape ADDRESS, et se réinitialise dès qu'on la
  // quitte (changement d'étape, ou dossier confirmé) pour ne jamais afficher
  // une suggestion obsolète sur une autre étape du parcours.
  React.useEffect(() => {
    if (context.step !== "ADDRESS" || sending) {
      setAddressSuggestions([]);
      setAddressSuggestionsSource(null);
      setAddressSuggestionsLoading(false);
      return;
    }
    const query = input.trim();
    if (query.length < 3) {
      setAddressSuggestions([]);
      setAddressSuggestionsSource(null);
      setAddressSuggestionsLoading(false);
      return;
    }
    setAddressSuggestionsLoading(true);
    // Le AbortController est créé ICI (pas dans le setTimeout) pour que la
    // fonction de nettoyage de cet effet puisse réellement l'annuler, que ce
    // soit le délai de 300 ms qui n'a pas encore expiré (frappe suivante,
    // changement d'étape) ou une requête déjà partie (composant démonté) —
    // le retour d'un setTimeout n'étant lui-même jamais utilisé comme
    // nettoyage par React, contrairement au retour direct de cet effet.
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/lydie/adresse-suggestions?q=${encodeURIComponent(query)}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data: { suggestions?: AddressSuggestion[]; source?: AddressSuggestionSource }) => {
          setAddressSuggestions(data.suggestions ?? []);
          setAddressSuggestionsSource(data.source ?? "UNAVAILABLE");
        })
        .catch(() => {
          // Repli silencieux (inclut l'abandon volontaire via
          // controller.abort() ci-dessous) : la saisie manuelle reste
          // toujours possible, jamais bloquée par un souci réseau côté
          // suggestions (voir BAN-INTEGRATION-PLAN.md §4, Fallback).
          setAddressSuggestions([]);
          setAddressSuggestionsSource("UNAVAILABLE");
        })
        .finally(() => setAddressSuggestionsLoading(false));
    }, 300);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [input, context.step, sending]);

  function selectAddressSuggestion(suggestion: AddressSuggestion) {
    setAddressSuggestions([]);
    setAddressSuggestionsSource(null);
    void send(suggestion.label);
  }

  function startNewRequest() {
    clearPersistedState();
    setMessages(initialMessages);
    setContext(INITIAL_LYDIE_CONTEXT);
    setDossier(null);
    setRequiresAuth(false);
    setBackendUnavailable(false);
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    // Mission P3.3 (Dossier Vivant) : sur un navigateur qui n'a jamais
    // parlé à Lydie (aucun état persistant au chargement) ET pour ce tout
    // premier message précisément, on n'envoie volontairement AUCUN
    // `context` — cela laisse le serveur vérifier si ce client, une fois
    // authentifié, a déjà un dossier à reprendre (voir route.ts) plutôt que
    // de lui imposer un INITIAL_LYDIE_CONTEXT décidé ici. Dès la réponse
    // reçue, `context` (qu'il vienne d'un dossier repris ou d'un vrai
    // départ à zéro) est stocké normalement et sera toujours envoyé
    // ensuite — voir la définition de `hadPersistedStateOnLoad` ci-dessus.
    const isFreshFirstMessage = !hadPersistedStateOnLoad.current && !messages.some((m) => m.role === "user");

    const userMessage: ChatMessage = { id: crypto.randomUUID(), role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSending(true);

    try {
      const response = await fetch("/api/lydie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          context: isFreshFirstMessage ? undefined : context,
          dossierId: context.dossierId ?? dossier?.id ?? undefined,
        }),
      });

      const data = (await response.json()) as LydieApiResponse;
      if (!response.ok || !data.reply) {
        throw new Error(data.error?.message || `Réponse ${response.status}`);
      }

      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "assistant", content: data.reply as string }]);
      if (data.context) setContext(data.context);
      setRequiresAuth(Boolean(data.requiresAuth));
      if (data.dossier) setDossier(data.dossier);
    } catch {
      setBackendUnavailable(true);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "system",
          content:
            "L'assistant Lydie n'est pas encore connecté techniquement. Votre message n'a pas été perdu : vous pouvez le renvoyer une fois le service disponible, ou nous contacter directement en attendant.",
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await send(input);
  }

  // A-t-on déjà commencé le parcours ? (un seul message utilisateur suffit
  // à le déterminer — voir le commentaire de tête de fichier.)
  const hasStarted = messages.some((m) => m.role === "user");
  // Réponses rapides "type de projet" affichées dans la conversation à
  // l'étape PROJECT (mode déjà choisi, type de projet pas encore détecté) —
  // mêmes messages préréglés que l'écran d'entrée, voir presets.ts.
  const showProjectQuickReplies = hasStarted && context.step === "PROJECT" && !sending;
  // Message de secours (BAN-INTEGRATION-PLAN.md §5-6, LV1-103) : couvre à la
  // fois le cas "maison neuve non encore répertoriée" et le cas "lieu-dit"
  // (aucun des deux ne produit de suggestion exploitable — voir
  // addressSuggestions.ts#parseFeatures, qui ignore toute entrée sans les 4
  // composants). N'affiche jamais un message d'échec technique : la BAN a
  // répondu (source "BAN"), simplement sans résultat utilisable pour cette
  // saisie — la saisie manuelle reste le chemin normal, jamais bloqué.
  const showAddressFallbackHint =
    context.step === "ADDRESS" &&
    !addressSuggestionsLoading &&
    addressSuggestionsSource === "BAN" &&
    addressSuggestions.length === 0 &&
    input.trim().length >= 3;

  if (!hasStarted) {
    return <EntryScreen onSend={send} sending={sending} />;
  }

  return (
    <ConversationShell context={context} onClearConversation={startNewRequest}>
      {backendUnavailable ? (
        <div className="mx-5 mt-4 flex items-start gap-3 rounded-m border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-200">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            L&apos;échange avec Lydie a rencontré un problème technique. Vous pouvez
            nous joindre via la{" "}
            <Link href="/contact" className="font-semibold underline">
              page de contact
            </Link>
            .
          </p>
        </div>
      ) : null}

      {requiresAuth ? (
        <div className="mx-5 mt-4 flex items-start gap-3 rounded-m border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            Votre demande est prête. Pour créer votre dossier,{" "}
            <Link href="/connexion" className="font-semibold underline">
              connectez-vous
            </Link>{" "}
            ou{" "}
            <Link href="/inscription" className="font-semibold underline">
              créez un compte
            </Link>
            , puis confirmez à nouveau — rien de ce que vous avez dit n&apos;est perdu.
          </p>
        </div>
      ) : null}

      {dossier ? (
        <div className="mx-5 mt-4 flex items-start gap-3 rounded-m border border-sky-400/30 bg-sky-400/10 p-4 text-sm text-sky-100">
          <Info className="mt-0.5 h-5 w-5 shrink-0" aria-hidden="true" />
          <p>
            Votre dossier {dossier.numero ?? ""} a été créé.{" "}
            <Link href={`/espace-client/dossiers/${dossier.id}`} className="font-semibold underline">
              Ouvrir mon dossier
            </Link>
            {" · "}
            <button type="button" onClick={startNewRequest} className="font-semibold underline">
              Démarrer une nouvelle demande
            </button>
            .
          </p>
        </div>
      ) : null}

      <div
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
        role="log"
        aria-live="polite"
        aria-label="Conversation avec Lydie"
      >
        {messages.map((message) => (
          <ChatBubble key={message.id} message={message} />
        ))}
        <div ref={listEndRef} />
      </div>

      {showProjectQuickReplies ? (
        <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 sm:px-6">
          {LYDIE_PROJECT_CARDS.map((card) => (
            <button
              key={card.id}
              type="button"
              onClick={() => void send(card.message)}
              className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-sky-100 hover:border-sky-400/60 hover:bg-white/10"
            >
              {card.label}
            </button>
          ))}
          <button
            type="button"
            onClick={() => void send(LYDIE_DONT_KNOW_MESSAGE)}
            className="rounded-full bg-sky-500 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-sky-400"
          >
            Je ne sais pas — Expliquez-moi mon projet
          </button>
        </div>
      ) : null}

      {context.step === "ADDRESS" && addressSuggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2 border-t border-white/10 px-4 py-3 sm:px-6" aria-label="Suggestions d'adresse">
          {addressSuggestions.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              onClick={() => selectAddressSuggestion(suggestion)}
              className="rounded-full border border-white/15 bg-white/5 px-3.5 py-1.5 text-xs font-medium text-sky-100 hover:border-sky-400/60 hover:bg-white/10"
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      ) : null}

      {showAddressFallbackHint ? (
        <p className="px-4 pt-3 text-xs text-sky-200/60 sm:px-6" role="status">
          Je n&apos;ai pas retrouvé cette adresse. Continuons ensemble : vous pouvez la saisir complètement à la main
          (numéro, voie, code postal, ville).
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="flex items-end gap-3 border-t border-white/10 p-4 sm:p-6">
        <label htmlFor="chat-input" className="sr-only">
          Votre message pour Lydie
        </label>
        <textarea
          id="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          rows={1}
          placeholder="Écrivez votre message ici…"
          className="flex-1 resize-none rounded-m border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-sky-200/40 outline-none focus:border-sky-400"
        />
        <button
          type="submit"
          disabled={sending || input.trim().length === 0}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-m bg-sky-500 text-white transition hover:bg-sky-400 disabled:opacity-50"
          aria-label="Envoyer le message"
        >
          <Send className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>
    </ConversationShell>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.role === "system") {
    return (
      <div className="mx-auto max-w-md rounded-m bg-amber-400/10 px-4 py-2 text-center text-xs text-amber-200">
        {message.content}
      </div>
    );
  }

  const isUser = message.role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-m px-4 py-2.5 text-sm leading-relaxed sm:max-w-[70%] whitespace-pre-line",
          isUser ? "bg-sky-500 text-white" : "bg-white/10 text-sky-50"
        )}
      >
        {message.content}
      </div>
    </div>
  );
}
