# Plan d'intégration BAN (Base Adresse Nationale)

Document de préparation, **aucun code modifié par ce document**. Décrit l'architecture déjà posée (`src/lib/lydie/addressSuggestions.ts`, écrit et testé en P2A.1) et ce qui reste à décider/construire en P2B.

## 1. Architecture prévue

```
Client (saisie adresse, texte partiel)
        │
        ▼
route.ts (couche API) ── appelle ──▶ fetchAddressSuggestions(query)
        │                                    │
        │                                    ▼
        │                         BAN_ENDPOINT (api-adresse.data.gouv.fr)
        │                                    │
        │                     ok ──────┐     │ échec/timeout/court
        │                              ▼     ▼
        │                    { suggestions, source:"BAN" }  { [], source:"UNAVAILABLE" }
        ▼
Client affiche suggestions OU laisse le client continuer à taper
        │ (le client choisit une suggestion, ou tape lui-même)
        ▼
Message texte envoyé à stepLydie() comme n'importe quel autre message
        │
        ▼
hasCompleteAddress() / ADDRESS_PATTERN — inchangés, revalident tout
```

Point d'architecture non négociable : `fetchAddressSuggestions()` n'est **jamais** appelé depuis `stepLydie()` (`engine.ts`). `engine.ts` documente explicitement `stepLydie()` comme une fonction pure, sans accès réseau ni base de données — c'est ce qui la rend testable unitairement sans dépendance, et c'est une garantie déjà exploitée par toute la suite de tests existante (156 vérifications). Introduire un appel réseau à l'intérieur casserait cette garantie. La suggestion reste donc un enrichissement de la couche API, dont le résultat n'est jamais transmis à `stepLydie()` comme si le client l'avait tapé lui-même — il faut toujours un geste explicite du client (sélection, ou saisie manuelle) qui repasse par le canal message normal.

## 2. Endpoint

- URL : `https://api-adresse.data.gouv.fr/search/` (constante `BAN_ENDPOINT` dans `addressSuggestions.ts`).
- Paramètres envoyés : `q=<texte>&limit=5&autocomplete=1`.
- Aucune clé/authentification requise (service public gratuit) — donc aucun secret à gérer, aucune variable d'environnement à provisionner pour ce point précis.
- Réponse attendue : GeoJSON avec un tableau `features[]`, chaque `feature.properties` porte `housenumber`, `street`, `postcode`, `city` — c'est exactement ce que `parseFeatures()` lit ; toute autre forme de réponse (ex. `features` absent) est déjà gérée sans crash (liste vide renvoyée).

## 3. Gestion du timeout

- `REQUEST_TIMEOUT_MS = 3000` (3 secondes), déjà implémenté via `AbortController` : la requête est annulée après ce délai, la promesse échoue, et l'exception est interceptée par le `catch` du `try/finally` — jamais propagée à l'appelant.
- Si `AbortController` n'existe pas dans l'environnement d'exécution (cas très improbable côté Node moderne ou navigateur), le code continue sans timeout applicatif plutôt que de planter — dégradation silencieuse déjà en place, à re-vérifier explicitement lors de l'exécution réelle en P2B.3 (voir `P2B-PLAN.md`).
- Aucune tentative de nouvelle requête (retry) n'est prévue : un échec est un échec, on retombe immédiatement sur le fallback plutôt que de multiplier les appels vers un service public tiers sans y avoir réfléchi (question de bon usage réseau, pas de contrainte technique) — **à confirmer avec l'utilisateur si un retry unique est souhaité en P2B**.

## 4. Fallback

- Toute condition d'échec (texte < 3 caractères, pas de `fetch` disponible, réponse HTTP non-OK, exception quelconque — réseau, timeout, JSON invalide) renvoie systématiquement `{ suggestions: [], source: "UNAVAILABLE" }`. Jamais d'exception qui remonterait jusqu'à l'appelant.
- Le fallback n'est **pas une fonctionnalité dégradée cachée** : le champ `source` permet à l'appelant (route.ts, puis l'UI) de savoir explicitement si la liste vide vient d'un "aucun résultat" (`source: "BAN"`, `suggestions: []`) ou d'une indisponibilité du service (`source: "UNAVAILABLE"`) — utile pour, plus tard, afficher ou non un message du type "la recherche d'adresse n'est pas disponible, vous pouvez continuer à saisir votre adresse manuellement" (texte à valider avec l'utilisateur, pas décidé ici).
- Dans tous les cas, le client peut toujours continuer à taper son adresse manuellement : l'étape ADDRESS de `engine.ts` (avec la fusion `addressDraft`, voir `LYDIE-MEMORY-SPEC.md`) fonctionne indépendamment de ce module et n'a jamais besoin d'une suggestion pour aboutir.
- **Preuve déjà obtenue en P2A.1** : le chemin réseau-indisponible n'est pas une simulation dans cet environnement — le proxy sortant de ce sandbox bloque réellement `api-adresse.data.gouv.fr` (confirmé par `curl` : *CONNECT tunnel failed, response 403* ; par `WebFetch` : *ROBOTS_DISALLOWED*), donc le test correspondant a observé un vrai échec réseau, pas un mock.

## 5. Maisons neuves

- La BAN est alimentée par les bases cadastrales/postales officielles ; une construction très récente (permis de construire en cours, adresse pas encore enregistrée) peut ne renvoyer **aucune** suggestion, ou une suggestion imprécise (numéro absent, voie seule).
- Le code actuel gère déjà ce cas sans le nommer explicitement : `parseFeatures()` ignore toute entrée sans `rue`/`codePostal`/`ville`, donc une suggestion incomplète n'est simplement jamais proposée plutôt que d'être complétée en devinant.
- **Décision produit non tranchée (à valider en P2B.0)** : faut-il afficher un message spécifique du type "adresse récente non trouvée, vous pouvez la saisir manuellement" dès que `suggestions.length === 0` et `source === "BAN"` (résultat vide mais service disponible) ? Ce texte relève du ton officiel de Lydie et doit être validé avant d'être codé — non décidé par ce document.

## 6. Lieux-dits

- Une adresse rurale de type "Lieu-dit Les Trois Chênes, 59264 Onnaing" (pas de numéro, pas de "rue") existe dans la BAN sous une forme différente (`type: "locality"` plutôt que `"housenumber"` dans la réponse réelle) — non géré aujourd'hui par `parseFeatures()`, qui ne lit que `housenumber`/`street`/`postcode`/`city`.
- Plus fondamentalement : `hasCompleteAddress()` / `ADDRESS_PATTERN` (protégé, jamais rendu plus permissif dans cette mission) exigent un numéro et une voie au sens rue — un lieu-dit sans numéro échouera à cette validation même si une suggestion BAN existait.
- **Ce point est un vrai sujet métier non résolu, pas un détail technique** : accepter les lieux-dits demanderait soit d'assouplir `ADDRESS_PATTERN` (interdit sans décision explicite et nouvelle mission — modifie un fichier protégé), soit de créer un chemin de validation séparé pour ce cas. Aucune des deux options n'est tranchée ici ; signalé pour arbitrage utilisateur avant tout code (P2B.4).

## 7. Sélection d'une suggestion

- Non construit en P2A.1 (explicitement hors périmètre, flag NON VÉRIFIÉ / décision de portée non tranchée).
- Principe déjà posé pour P2B.2 (voir `P2B-PLAN.md`) : quand le client sélectionne une suggestion, son `label` (déjà formaté exactement comme une adresse valide, ex. `"42 Rue Voltaire, 59264 Onnaing"`) est envoyé comme un message normal du client, donc repasse par `stepLydie()` → `hasCompleteAddress()` sans aucun chemin de validation séparé ni raccourci.
- Ce choix évite de créer un deuxième point d'entrée pour "adresse validée sans passer par le parseur" — une suggestion reste une proposition de texte, jamais une adresse validée par ce module lui-même (rappelé aussi dans le fichier source).
- Détail d'UX non tranché : liste déroulante, boutons, ou simple rappel textuel ? Dépend du Design System évoqué par l'utilisateur (LAP-001/LMP-001) — à aligner avec ces éléments visuels une fois la décision de portée prise, jamais improvisé dans le code avant cette validation.

## 8. Sécurité

- **Aucune donnée personnelle envoyée à un tiers au-delà de ce que le client a déjà tapé** : la requête BAN transmet uniquement le texte de recherche (`q=...`), jamais d'identifiant de dossier, de nom, d'email ou tout autre champ du contexte Lydie — vérifié par lecture du code (`fetchAddressSuggestions(query, ...)` ne reçoit qu'une chaîne).
- **Aucune clé API à protéger** : service public sans authentification, donc pas de secret à stocker côté serveur ou client pour ce point précis — réduit la surface de risque comparé à une intégration avec clé.
- **Aucune écriture** : ce module ne modifie ni la base Prisma ni l'état J20 ; une suggestion BAN n'est jamais persistée telle quelle, seule l'adresse finalement validée par `hasCompleteAddress()` (après sélection ou saisie manuelle) continue son chemin normal déjà existant vers `Demande.adresse`.
- **Encodage de l'URL** : `encodeURIComponent(trimmed)` déjà appliqué au texte de recherche avant construction de l'URL — protège contre une injection dans la requête HTTP via des caractères spéciaux tapés par le client.
- **Fuite d'information par la requête réseau elle-même** : chaque frappe envoyée à la BAN révèle au service tiers un fragment d'adresse en cours de saisie (comportement inhérent à toute autocomplétion tierce, pas spécifique à ce code) — point à mentionner dans une politique de confidentialité si l'utilisateur active cette fonctionnalité en production ; non tranché ici, signalé pour information.
- **Débit/abus** : aucune limitation de fréquence d'appel n'est implémentée côté client dans ce module (pas de debounce) — si l'UI de P2B.2 déclenche un appel à chaque frappe sans limitation, cela peut solliciter excessivement le service public de la BAN. **Recommandation non codée ici** : ajouter un debounce (ex. 300ms) côté UI avant d'appeler `fetchAddressSuggestions()` — décision d'implémentation P2B.2, pas de ce module.

## 9. Ce qui reste NON VÉRIFIÉ (rappel, détail complet dans `TECH-DEBT-P2A1.md`)

- L'appel réseau réel contre de vraies données BAN (bloqué par le proxy sortant de ce sandbox de développement).
- Le comportement réel face à une adresse de maison neuve ou de lieu-dit (non testable sans accès réseau réel, et non tranché côté validation métier pour les lieux-dits).
