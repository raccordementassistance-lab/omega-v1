# Carte des fichiers — `src/lib/lydie/*`

Document de préparation, **aucun code modifié par ce document**. Établi par lecture directe des 9 fichiers du dossier au moment de cette livraison.

## 1. Vue d'ensemble — qui appelle qui

```
route.ts (API, hors src/lib/lydie/ — couche appelante)
   │
   ├──▶ engine.ts            (stepLydie — moteur conversationnel réel, PUR)
   │        │
   │        └── utilise ADDRESS_PATTERN / hasCompleteAddress() ─▶ parseAddress.ts
   │
   ├──▶ resume.ts             (reprise d'un dossier existant → LydieContext)
   │        └── importe INITIAL_LYDIE_CONTEXT, LydieProjectType ◀── engine.ts
   │
   ├──▶ addressSuggestions.ts (BAN — appelé depuis route.ts UNIQUEMENT, jamais depuis engine.ts)
   │
   └──▶ (Lydie V2, parallèle, pas encore branché en production)
            orchestrator.ts (observe/orchestrate)
                 ├──▶ extraction.ts   (candidats bruts dans le texte)
                 ├──▶ context.ts      (fusion + protection des valeurs confirmées)
                 │        └──▶ (types LydieProjectType) ◀── engine.ts
                 └──▶ reasoning.ts    (recommandation lisible, lecture seule)
                          └──▶ documentRecommendations.ts (suggestions informatives, isBlocking:false)
```

## 2. Rôle de chaque fichier

| Fichier | Rôle |
|---|---|
| `engine.ts` | Moteur conversationnel Lydie **réellement utilisé en production**. Exporte `stepLydie()`, `LydieContext`, `LydieStep`, `LydieProjectType`, `INITIAL_LYDIE_CONTEXT`, `isSkip`, `isNegative`, `isValidEmail`. Fonction **pure** : aucun accès réseau ni base de données — c'est ce qui la rend testable unitairement sans dépendance. Contient `normalize()` (canonicalisation apostrophes + accents), `hasCompleteAddress()`/`ADDRESS_PATTERN` (via `parseAddress.ts`), `addressDraft` et `buildAddressMergeCandidates()` (fusion d'adresse multi-messages, P2A.1). |
| `parseAddress.ts` | Validation ET découpage stricts d'une adresse en 4 composants (numéro, voie, code postal, ville) via `ADDRESS_PATTERN` / `parseAddressStrict()` / `isCompleteAddress()`. N'est PAS un géocodage réel — vérifie seulement un format reconnaissable, jamais l'existence réelle de l'adresse. Aucune dépendance vers un autre fichier de ce dossier. |
| `resume.ts` | Reconstruit un `LydieContext` exploitable à partir des données réellement en base (`Demande`/`Adresse`) quand le client revient sans contexte local (autre appareil, cache vidé). Exporte aussi `buildDemandeDescription()`/`splitDemandeDescription()` (encodage détails+documents dans le champ texte unique `Demande.description`) et `buildMandatDocumentData()` (données du document qui matérialise les 3 consentements du mandat déjà enregistrés — ne fait que construire l'objet, l'écriture Prisma elle-même est faite par `route.ts`, hors de ce fichier). Importe `LydieContext`/`LydieProjectType`/`INITIAL_LYDIE_CONTEXT` depuis `engine.ts`. |
| `addressSuggestions.ts` | Service optionnel d'interrogation de la BAN (Base Adresse Nationale). Exporte `fetchAddressSuggestions()`, jamais appelé depuis `engine.ts` — prévu pour être appelé depuis `route.ts` (couche API), avec un résultat qui reste une simple liste de propositions, jamais transmis à `stepLydie()` comme si le client l'avait tapé. Toujours un résultat (`source: "BAN"` ou `"UNAVAILABLE"`), jamais une exception. Aucune dépendance vers un autre fichier de ce dossier (module autonome). |
| `orchestrator.ts` | Couche 1 de Lydie V2 (parallèle, pas branchée en production) : `observe()`/`orchestrate()`, classification d'intention (`LydieIntent`), statuts épistémiques (`EpistemicStatus`). Possède sa propre copie de `normalize()` (alignée avec `engine.ts` pour l'apostrophe en P2A.1, mais reste un fichier séparé, pas un import partagé). Aucun import Prisma ni `state-machine-engine` — fonction pure documentée comme telle. |
| `extraction.ts` | Couche 2 de Lydie V2 : repère les candidats bruts dans le texte (`ObservedValue`, `ExtractionResult`, `unknownValue`). Possède sa propre copie de `normalize()` (également alignée en P2A.1). Utilisé par `context.ts` (import de `ObservedValue`, `ExtractionResult`, `unknownValue`). |
| `context.ts` | Couche 3 de Lydie V2 : `mergeWorkingContext()` — fusionne une extraction brute dans le contexte de travail du tour précédent, en appliquant la règle de protection des données confirmées (une valeur `USER_CONFIRMED`/`VALIDATED` n'est jamais écrasée silencieusement ; toute contradiction produit une `Proposal` en attente de confirmation explicite). Applique aussi la règle métier « EXTENSION » (jamais mappée automatiquement vers un `LydieProjectType`). Importe `LydieProjectType` depuis `engine.ts`, et les types depuis `orchestrator.ts`/`extraction.ts`. Fonction pure, aucune écriture. |
| `reasoning.ts` | Couche 4 (dernière) de Lydie V2 : `reason()` — lit uniquement le `WorkingContext` déjà fusionné par `context.ts` pour produire une recommandation lisible (champs manquants, ambiguïtés, contradictions, proposals, documents recommandés, prochaine question suggérée). Ne modifie jamais le contexte, purement déterministe. Importe `getRecommendedDocuments` depuis `documentRecommendations.ts`, et les types depuis `context.ts`. |
| `documentRecommendations.ts` | Suggestions documentaires **informatives uniquement** (`getRecommendedDocuments()`), pour anticiper le traitement Enedis — jamais bloquantes. Chaque entrée porte `isBlocking: false`. Rappel structurel explicite dans les commentaires : DOCUMENT À ANTICIPER ≠ DOCUMENT BLOQUANT J20 ; `assertGuards()` (J20) ne lit aucune donnée de ce fichier. Importe `DocumentType` depuis `@prisma/client` (type uniquement) et `LydieProjectType` depuis `engine.ts`. Réutilisé tel quel par `reasoning.ts`. |

## 3. Fichiers critiques (impact large si modifiés)

- **`engine.ts`** — le plus critique du dossier : moteur réellement utilisé en production, protégé explicitement depuis le début de cette mission. Toute modification impacte potentiellement `resume.ts`, `route.ts` et l'ensemble des 44+10 tests dédiés (`lydie-engine.test.ts`, `lydie-apostrophe-and-address-completion.test.ts`).
- **`parseAddress.ts`** — `hasCompleteAddress()`/`ADDRESS_PATTERN` sont le seul rempart contre une adresse mal formée acceptée par erreur ; toute nouvelle fonctionnalité (fusion, suggestions BAN) doit continuer à revalider via ce fichier inchangé plutôt que de le contourner ou de l'assouplir.
- **`route.ts`** (hors de ce dossier, `src/app/api/lydie/`) — point d'entrée unique qui relie `engine.ts`/`resume.ts`/le schéma Zod à J20/Prisma/mandat ; c'est le seul fichier de la chaîne Lydie qui touche réellement J20 et Prisma, donc le plus sensible pour l'intégrité de la state machine.

## 4. Fichiers qui ne doivent pas être modifiés sans audit préalable

- `engine.ts`, `parseAddress.ts` : fichiers protégés explicitement par cette mission depuis le début (liste rappelée dans chaque livraison) — toute modification nécessite un format « stop-and-report » avant d'être faite, jamais une modification directe.
- `route.ts` : bien que hors de `src/lib/lydie/`, il matérialise les appels à J20 (`transitionDossierInTransaction`, `assertGuards`) et à Prisma (mandat, `Dossier.version`) — même règle d'audit préalable.
- `documentRecommendations.ts` : chaque `type: DocumentType` doit correspondre à une valeur réelle de l'enum Prisma (`schema.prisma`) — une modification sans vérifier l'enum casserait silencieusement le suivi des documents ; nécessite une relecture du schéma avant tout ajout.

## 5. Fichiers à risque plus faible (mais jamais "libres" pour autant)

- `orchestrator.ts`, `extraction.ts`, `context.ts`, `reasoning.ts` : architecture Lydie V2, **pas encore branchée en production** (confirmé par lecture — aucun appel depuis `route.ts` observé). Modifier ces fichiers n'affecte donc pas le comportement actuellement servi aux clients, mais reste soumis aux mêmes règles générales (fonctions pures, aucun import Prisma/J20) et à la suite de tests dédiée (`lydie-orchestrator.test.ts`, `lydie-orchestrator-v2.test.ts`, 22+31 tests).
- `addressSuggestions.ts` : fichier neuf (P2A.1), isolé (aucune dépendance interne au dossier), conçu pour être étendu (P2B) sans toucher aux autres fichiers listés ici.
