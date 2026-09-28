/**
 * Suggestions d'adresse — Lydie V2, enrichissement OPTIONNEL de l'étape
 * ADDRESS, JAMAIS bloquant et JAMAIS une décision métier.
 *
 * Portée exacte de ce module (mission P2A.1, tâche 2) :
 *   - interroge la Base Adresse Nationale (BAN, data.gouv.fr — aucune clé
 *     requise, service public) pour proposer des adresses correspondant à
 *     un texte partiel ;
 *   - toute erreur réseau, timeout, réponse invalide ou absence de
 *     résultat retourne `{ suggestions: [], source: "UNAVAILABLE" }` —
 *     JAMAIS une exception qui remonterait jusqu'à l'appelant ;
 *   - ne modifie, ne valide et ne remplace JAMAIS `hasCompleteAddress()`
 *     ni `stepLydie()` (engine.ts, protégé, non touché par ce fichier) :
 *     une suggestion reste une PROPOSITION à choisir, jamais une adresse
 *     retenue automatiquement par ce module lui-même.
 *   - aucun import Prisma, aucun accès à J20/`state-machine-engine`,
 *     aucune écriture : fonction async pure du point de vue métier (le
 *     seul effet de bord est l'appel réseau lui-même, jamais un état
 *     partagé ni une écriture).
 *
 * IMPORTANT — appelé DEPUIS route.ts (couche API), jamais depuis
 * `stepLydie()` : `engine.ts` documente explicitement `stepLydie()` comme
 * une fonction PURE, sans accès réseau ni base de données, ce qui est ce
 * qui la rend testable unitairement sans dépendance — introduire un appel
 * réseau à l'intérieur casserait cette garantie déjà annoncée et déjà
 * exploitée par toute la suite de tests existante. Ce module reste donc un
 * enrichissement séparé, appelé en parallèle, dont le résultat n'est
 * qu'une liste de PROPOSITIONS pour l'interface — jamais transmis à
 * `stepLydie()` comme si l'utilisateur l'avait tapé lui-même.
 *
 * NON VÉRIFIÉ dans cet environnement de développement : l'appel réseau
 * réel à `api-adresse.data.gouv.fr` est bloqué par la liste blanche du
 * proxy sortant de ce conteneur (confirmé par exécution réelle : voir le
 * rapport de livraison — `curl` renvoie « CONNECT tunnel failed, response
 * 403 », `WebFetch` renvoie « ROBOTS_DISALLOWED »). Le chemin « échec réseau
 * → fallback » est en revanche RÉELLEMENT exercé par ce blocage lui-même
 * (voir les tests dédiés), donc bien PASS par exécution réelle — seul le
 * scénario « la BAN répond avec de vraies données » n'a pas pu être
 * observé en conditions réelles depuis ici.
 */

export interface AddressSuggestion {
  /** Libellé complet, prêt à afficher et à réutiliser tel quel comme adresse Lydie (format identique à celui attendu par hasCompleteAddress/parseAddressStrict). */
  label: string;
  numero: string | null;
  rue: string;
  codePostal: string;
  ville: string;
}

export type AddressSuggestionSource = "BAN" | "UNAVAILABLE";

export interface AddressSuggestionResult {
  suggestions: AddressSuggestion[];
  source: AddressSuggestionSource;
}

const BAN_ENDPOINT = "https://api-adresse.data.gouv.fr/search/";
const REQUEST_TIMEOUT_MS = 3000;
const MINIMUM_QUERY_LENGTH = 3;

/** Type minimal du sous-ensemble de `fetch` réellement utilisé — injectable pour les tests, sans dépendre d'un type DOM/Node particulier. */
export type FetchLike = (
  input: string,
  init?: { signal?: AbortSignal }
) => Promise<{ ok: boolean; json: () => Promise<unknown> }>;

function resolveDefaultFetch(): FetchLike | null {
  return typeof fetch === "function" ? (fetch as unknown as FetchLike) : null;
}

function parseFeatures(data: unknown): AddressSuggestion[] {
  const features = Array.isArray((data as { features?: unknown[] })?.features)
    ? (data as { features: unknown[] }).features
    : [];
  const suggestions: AddressSuggestion[] = [];
  for (const feature of features) {
    const props = (feature as { properties?: Record<string, unknown> })?.properties;
    const numero = typeof props?.housenumber === "string" ? props.housenumber : null;
    const rue = typeof props?.street === "string" ? props.street : null;
    const codePostal = typeof props?.postcode === "string" ? props.postcode : null;
    const ville = typeof props?.city === "string" ? props.city : null;
    // Une suggestion sans les 4 composants n'est pas exploitable par
    // hasCompleteAddress() : on ne la propose pas plutôt que de la
    // compléter en devinant (aucune supposition métier ici).
    if (!rue || !codePostal || !ville) continue;
    suggestions.push({
      label: numero ? `${numero} ${rue}, ${codePostal} ${ville}` : `${rue}, ${codePostal} ${ville}`,
      numero,
      rue,
      codePostal,
      ville,
    });
  }
  return suggestions;
}

/**
 * Interroge la BAN pour un texte partiel. Ne lève jamais d'exception :
 * toute condition d'échec (réseau, timeout, réponse invalide, texte trop
 * court) retourne `source: "UNAVAILABLE"` avec une liste vide — c'est ce
 * qui garantit le fallback manuel obligatoire (mission, tâche 2, cas 3) :
 * l'appelant peut toujours ignorer ce résultat et laisser le client
 * continuer à saisir son adresse manuellement (déjà géré par
 * `engine.ts#ADDRESS`, avec fusion de fragments — voir addressDraft).
 */
export async function fetchAddressSuggestions(query: string, fetchImpl?: FetchLike): Promise<AddressSuggestionResult> {
  const trimmed = query.trim();
  if (trimmed.length < MINIMUM_QUERY_LENGTH) {
    return { suggestions: [], source: "UNAVAILABLE" };
  }

  const impl = fetchImpl ?? resolveDefaultFetch();
  if (!impl) return { suggestions: [], source: "UNAVAILABLE" };

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutHandle = controller ? setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS) : null;

  try {
    const url = `${BAN_ENDPOINT}?q=${encodeURIComponent(trimmed)}&limit=5&autocomplete=1`;
    const response = await impl(url, controller ? { signal: controller.signal } : undefined);
    if (!response.ok) return { suggestions: [], source: "UNAVAILABLE" };
    const data = await response.json();
    return { suggestions: parseFeatures(data), source: "BAN" };
  } catch {
    // Réseau indisponible, timeout, JSON invalide, etc. — jamais remonté :
    // c'est précisément le cas 3 de la mission (« l'API ne répond pas »).
    return { suggestions: [], source: "UNAVAILABLE" };
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}
