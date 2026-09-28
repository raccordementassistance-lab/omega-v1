# FILE-MAP.md — Carte rapide des fichiers importants (OMEGA v1.0)

Ne liste que les fichiers pertinents pour comprendre ou auditer le projet — pas une arborescence exhaustive (voir `unzip -l` pour ça). Chaque ligne dit ce que le fichier fait et, quand c'est pertinent, son statut de vérification.

## Cœur métier — Lydie (moteur conversationnel)

| Fichier | Rôle | Statut |
|---|---|---|
| `src/lib/lydie/engine.ts` | Moteur pur `stepLydie()` — toute la logique de conversation, déterministe, sans IA générative. Contient `hasCompleteAddress()`/`ADDRESS_PATTERN` (**protégés, jamais modifiés depuis P2A.1**), `findGeoHint()`, `projectAcknowledgement()`. | 🟢 testé (62 tests) |
| `src/lib/lydie/parseAddress.ts` | Validation stricte d'une adresse (`parseAddressStrict`). | 🟢 testé (15 tests) |
| `src/lib/lydie/addressSuggestions.ts` | Appel et parsing des suggestions BAN (transport simulé dans les tests — jamais d'appel réseau réel exécuté ici). | 🟢 testé (7 tests) |
| `src/lib/lydie/orchestrator.ts` | Couche de raisonnement au-dessus du moteur (recommandations, cohérence avec J20). | 🟢 testé (22 + 31 tests) |
| `src/lib/lydie/resume.ts` | `deriveLydieContextFromDossier()` — reconstruit le contexte Lydie depuis Prisma (seulement `PROJECT` ou `DONE`, jamais un état intermédiaire). | 🟢 testé (7 tests) |
| `src/lib/lydie/documentRecommendations.ts` | Suggestions de documents, informatives, jamais bloquantes. | ⚪ test existant (`lydie-document-recommendations.test.ts`) non réexécuté cette session (voir `AUDIT-PACK.md` §3) |
| `src/lib/lydie/extraction.ts`, `context.ts`, `reasoning.ts` | Utilitaires internes du moteur. | 👁️ lecture uniquement |

## État du dossier — J20 / réseaux

| Fichier | Rôle | Statut |
|---|---|---|
| `src/state-machine/state-machine-engine.ts` | La State Machine J20 (15 états) — **jamais modifiée pendant tout le MVP**. | ⚪ test existant (`state-machine.test.ts`, utilise `vi.mock`) non réexécuté cette session |
| `src/lib/j20/client.ts` | Constantes/labels J20 côté client, utilisées pour l'affichage. | 👁️ lecture (dépendance des tests reseaux, non modifié) |
| `src/lib/j20/reseaux.ts` | `deriveReseaux()` — vue dérivée des 4 réseaux pour Mission Control, aucune table Prisma. | 🟢 testé (8 tests) |

## Mode Test officiel (protocole de validation)

| Fichier | Rôle | Statut |
|---|---|---|
| `src/lib/testmode/scenario.ts` | Le parcours officiel encodé en données pures + chronométrage + génération de rapport. | 🟢 testé (16 tests) |
| `src/components/testmode/TestModePanel.tsx` / `TestModeButton.tsx` | UI du Mode Test (bouton discret + panneau), montés dans `src/app/layout.tsx`. | 👁️ lecture uniquement (React non compilable dans l'environnement d'origine) |

## API / pages clés

| Fichier | Rôle | Statut |
|---|---|---|
| `src/app/api/lydie/route.ts` | Point d'entrée HTTP du chat Lydie ; contient la logique de reprise de dossier (« Dossier Vivant »). | 👁️ lecture uniquement |
| `src/app/chat/page.tsx` | Page du chat côté client, gère la persistance locale et l'envoi du premier message. | 👁️ lecture uniquement |
| `src/app/espace-client/dossiers/[id]/page.tsx` | Mission Control — affiche projet, documents, progression, réseaux. | 👁️ lecture uniquement |
| `src/lib/repositories/dossier.repository.ts` | Accès Prisma au Dossier (`findLatestForClient()` pour le Dossier Vivant). | 👁️ lecture uniquement |
| `src/lib/auth/roles.ts`, `src/lib/auth/session.ts` | Contrôle d'accès et résolution de session (Supabase + Prisma). | ⚪ test existant (`roles.test.ts`) non réexécuté cette session |

## Données

| Fichier | Rôle |
|---|---|
| `prisma/schema.prisma` | Schéma complet (User, Dossier, Adresse, Demande, Document, Devis, Message, TimelineEvent, AuditLog, etc.) — **aucune migration ajoutée pendant le MVP**. |
| `prisma/migrations/` | Historique des migrations — comparer les dates à celles des sprints pour confirmer l'absence de changement. |

## Tests

| Dossier | Contenu |
|---|---|
| `src/tests/unit/*.test.ts` | 13 fichiers de tests au total. 10 réexécutés et verts cette session (184 vérifications, voir `AUDIT-PACK.md`) ; 3 non réexécutés cette session (`state-machine.test.ts`, `roles.test.ts`, `lydie-document-recommendations.test.ts` — raisons dans `AUDIT-PACK.md` §3). |

## Documentation de gouvernance (à lire avant tout audit de code)

| Fichier | Rôle |
|---|---|
| `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md` | Référence de gouvernance permanente (règles immuables, feuille de route). |
| `DECISION-LOG.md` | **Index unique des décisions tranchées — fait foi en cas de divergence.** |
| `GOLD-MASTER.md` | État officiel du MVP au moment du gel OMEGA v1.0. |
| `KNOWN-LIMITATIONS.md` | Limites réellement prouvées, uniquement. |
| `P?.?-EXECUTION.md` (12 fichiers, P2A.1 → P3.4bis) | Rapport détaillé de chaque sprint, avec preuves. |

## Ce qui n'existe volontairement pas

- Aucun `vercel.json` (Next.js détecté nativement — voir `DEPLOY-VERCEL.md`).
- Aucune fausse table Prisma pour les réseaux (eau/fibre/gaz) — vue dérivée uniquement (`reseaux.ts`).
- Aucun test d'intégration HTTP réel dans ce dépôt (limite d'environnement, pas un choix produit — voir `KNOWN-LIMITATIONS.md`).
