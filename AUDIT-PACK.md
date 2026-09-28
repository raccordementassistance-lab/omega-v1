# AUDIT-PACK.md — Résumé technique pour audits externes (OMEGA Validation V1)

Destiné à un auditeur externe, humain ou IA, qui n'a pas suivi le développement. Ce document ne modifie aucun code — il résume, sans reformuler les faits, ce que les rapports de sprint (`P?.?-EXECUTION.md` → `GOLD-MASTER.md`) ont déjà établi. En cas de divergence de formulation avec un autre document, **`DECISION-LOG.md` fait foi**.

## 1. Ce qu'est le projet

Une plateforme d'accompagnement aux demandes de raccordement électrique (« Raccordement Assistance »), service indépendant non affilié à Enedis. Le produit repose sur 4 piliers :

- **Lydie** — conseillère conversationnelle déterministe (pas d'IA générative dans le moteur), qui qualifie un projet de raccordement.
- **Dossier Unique** — un identifiant, un seul dossier par client, créé à la confirmation du mandat.
- **Pluri Raccordé®** — le pôle métier officiel (électricité qualifiée réellement ; eau/fibre/gaz affichés en vue dérivée, jamais inventés).
- **Mission Control** — l'espace où le client suit son dossier (projet, documents, progression, réseaux).

## 2. Ce qui est protégé — à vérifier en priorité par tout audit

Ces règles sont des invariants de gouvernance, pas des détails d'implémentation. Un audit devrait vérifier qu'elles n'ont jamais été violées :

| Invariant | Où le vérifier |
|---|---|
| `hasCompleteAddress()` / `ADDRESS_PATTERN` jamais modifiés depuis P2A.1 | `src/lib/lydie/engine.ts` (grep sur ce nom, comparer avec `P2A1-RESULTATS.md`) |
| Aucune modification de la State Machine J20 (15 états) depuis le gel | `src/state-machine/` (non listé dans les fichiers modifiés d'aucun sprint depuis P2A.1) |
| Aucune migration Prisma introduite pendant le MVP | `prisma/migrations/` — comparer les dates avec les dates de sprint |
| Une ville seule (ex. « Bordeaux ») n'est jamais enregistrée comme adresse valide | `findGeoHint()` dans `engine.ts`, jamais écrit dans `context.address`/`addressDraft` |
| Aucune donnée réseau (eau/fibre/gaz) n'est inventée — toujours « À déterminer » sauf électricité | `src/lib/j20/reseaux.ts` (`deriveReseaux()`) |
| Chaque claim technique est accompagné d'une preuve réelle (POR-001) — jamais un résultat simulé présenté comme réel | Convention 🟢/👁️/⚪ appliquée dans chaque `P?.?-EXECUTION.md` |

## 3. État des preuves — ce qui a été réellement vérifié, et comment

Contrainte structurelle constante depuis P2A.1 : cet environnement de développement (Claude) ne peut ni installer les dépendances npm (403 sur les téléchargements de paquets, confirmé à plusieurs reprises), ni exécuter Next.js/Prisma. Toute preuve technique de ce projet repose donc sur :
- `tsc` (compilateur TypeScript seul, installé indépendamment de npm) — utilisé pour vérifier la compilation du code pur.
- Un shim `vitest` maison (`describe`/`it`/`expect` basés sur `node:assert`) — utilisé pour exécuter réellement les tests unitaires du code pur, dans un espace de vérification temporaire où les fichiers source réels sont copiés tels quels (jamais réécrits ni simplifiés pour les faire passer).

**Dernier état vérifié (sprint P3.4bis, 2026-09-28) :**
- `tsc -p tsconfig.json` → 0 erreur.
- **184 vérifications réellement exécutées, 0 échec**, réparties sur 10 fichiers de tests : `lydie-engine` (62), `lydie-orchestrator-v2` (31), `lydie-orchestrator` (22), `lydie-address` (15), `lydie-apostrophe-and-address-completion` (11), `lydie-reseaux` (8), `lydie-address-suggestions` (7), `lydie-resume` (7), `testmode-scenario` (16), `lydie-mandat-materialization` (5).

**Ce qui N'est PAS couvert par ce chiffre de 184 — à ne pas présumer vérifié :**
- `src/tests/unit/state-machine.test.ts` et `src/tests/unit/lydie-document-recommendations.test.ts` utilisent `vi.mock`/`vi.fn` (mocking Prisma), que le shim maison ne supporte pas — jamais réexécutés dans cette session.
- `src/tests/unit/roles.test.ts` dépend de `src/lib/auth/session.ts`, qui importe Supabase et Prisma réels — non portable dans l'espace de vérification isolé utilisé ici sans construire des stubs supplémentaires, ce qui n'a pas été fait (hors périmètre « aucun nouveau développement »).
- Ces 3 fichiers existent bien dans le dépôt et n'ont jamais été signalés comme testés dans aucun `P?.?-EXECUTION.md` antérieur non plus — leur statut réel est **non déterminé par ce projet à ce stade**, pas « validé par défaut ». Un audit externe avec un environnement npm complet peut les exécuter directement (`npx vitest run`).
- Aucun test d'intégration réel (HTTP → `route.ts` → Prisma → réponse) n'a jamais été exécuté — uniquement des tests unitaires sur du code pur.
- Aucune exécution live dans un navigateur réel (captures d'écran, chronométrage réel du Mode Test) n'a été obtenue.

## 4. Bugs trouvés et corrigés pendant le MVP (traçabilité)

| Bug | Sprint | Fichier | Correction |
|---|---|---|---|
| `\b` (limite de mot JS) ne détecte pas un contexte géographique après une préposition accentuée (« à Bordeaux ») | P2B.2 | `engine.ts` | Remplacement de `\b` par `(?:^|\s)` |
| Reprise automatique de dossier pouvait bloquer un nouveau projet derrière un dossier déjà `DONE` | P3.4 | `src/app/api/lydie/route.ts` | Reprise conditionnée à `derived.step !== "DONE"` |
| « modifier mon adresse email » routait vers l'adresse postale au lieu de l'e-mail | P3.4 | `engine.ts` | Réordonnancement : email vérifié avant adresse |

## 5. Limites connues (réellement prouvées — détail complet dans `KNOWN-LIMITATIONS.md`)

- Aucune exécution réelle possible de Next.js/Prisma/npm dans l'environnement de développement d'origine (voir §3).
- Aucun accès réseau sortant réel testé (BAN, Vercel, GitHub) depuis cet environnement.
- Seuls deux états (`PROJECT`, `DONE`) sont reconstructibles automatiquement depuis Prisma pour un client qui revient — pas d'état intermédiaire persisté.
- Eau/Fibre/Gaz toujours affichés « À déterminer » (décision produit, pas un défaut).

## 6. Comment un audit peut vérifier ces claims lui-même

1. Dans un environnement avec `npm` fonctionnel : `npm install && npx tsc --noEmit && npx vitest run` — doit reproduire (au minimum) les 184 vérifications listées en §3, plus potentiellement les 3 fichiers non couverts ici.
2. Comparer chaque ligne de `DECISION-LOG.md` avec le code réel cité en face.
3. Grep sur `hasCompleteAddress`, `ADDRESS_PATTERN`, et le dossier `prisma/migrations/` pour confirmer l'absence de modification depuis P2A.1.

## 7. Documents de référence, dans l'ordre de lecture recommandé

Voir `QUICK-START-AUDIT.md` pour l'ordre de lecture en moins de 5 minutes, et `FILE-MAP.md` pour la carte des fichiers.
