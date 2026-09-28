# P2A.1 — Résultats (Snapshot Officiel STABLE)

## Date / heure
Génération : **2026-09-27, 21:33 (Europe/Paris)** — 2026-09-27T19:33:54Z (UTC).

## Environnement d'exécution
- Node.js : `v22.22.2`
- npm : `10.9.7`
- OS : Ubuntu 24.04.4 LTS (Linux 6.18.44-fc-v37, x86_64)
- TypeScript : `6.0.3` (compilation isolée — stub de TYPE uniquement pour `@prisma/client#DocumentType`, déjà utilisé par `documentRecommendations.ts`, non modifié)
- Vitest réel **non installable** ici (`npm ci` → 403 sur `registry.npmjs.org`) : exécution réelle réalisée via un shim minimal `describe/it/expect` adossé à `node:assert` (aucun résultat supposé — chaque assertion échouée lève une exception réelle)

## Journal d'exécution horodaté (dernière passe avant snapshot)

```
2026-09-27T19:33:52Z  tsc -p tsconfig.json               → EXIT 0 (0 erreur)
2026-09-27T19:33:53Z  lydie-address-suggestions.test.js   → 7 passed, 0 failed
2026-09-27T19:33:54Z  lydie-address.test.js               → 15 passed, 0 failed
2026-09-27T19:33:54Z  lydie-apostrophe-and-address-completion.test.js → 10 passed, 0 failed
2026-09-27T19:33:54Z  lydie-engine.test.js                → 44 passed, 0 failed
2026-09-27T19:33:54Z  lydie-mandat-materialization.test.js→ 5 passed, 0 failed
2026-09-27T19:33:54Z  lydie-orchestrator-v2.test.js       → 31 passed, 0 failed
2026-09-27T19:33:54Z  lydie-orchestrator.test.js          → 22 passed, 0 failed
2026-09-27T19:33:54Z  lydie-resume.test.js                → 7 passed, 0 failed
2026-09-27T19:33:54Z  scénarios ad hoc (15 assertions apostrophes + adresse multi-messages) → 15/15 PASS
```

**Total : 141 tests unitaires + 15 assertions ad hoc = 156 vérifications réellement exécutées, 0 échec.**

## Tableau PASS / FAIL / NON VÉRIFIÉ

| # | Scénario | Résultat |
|---|---|---|
| 1 | `c'est bon` (apostrophe droite) | 🟢 PASS |
| 2 | `c'est bon` (apostrophe iPhone ’) | 🟢 PASS |
| 3 | `pas d'accord` (apostrophe droite) | 🟢 PASS |
| 4 | `pas d'accord` (apostrophe iPhone ’) | 🟢 PASS |
| 5 | `j'accepte` / `j'accepte` (iPhone) — non-régression | 🟢 PASS |
| 6 | Adresse complète en un seul message | 🟢 PASS |
| 7 | Adresse en deux messages (voie+ville, puis code postal) | 🟢 PASS |
| 8 | Adresse en trois messages (bonus) | 🟢 PASS |
| 9 | Fragments incohérents jamais acceptés comme adresse | 🟢 PASS |
| 10 | Autocomplétion BAN — appel réseau réel | ⚪ NON VÉRIFIÉ (réseau bloqué par le proxy sortant de cet environnement) |
| 11 | Autocomplétion BAN — parsing d'une réponse (transport simulé) | 🟢 PASS |
| 12 | Fallback manuel (l'API ne répond pas) | 🟢 PASS — exercé réellement (blocage réseau réel de cet environnement, pas un mock) |
| 13 | Non-régression complète (engine, orchestrateur V1, orchestrateur V2, resume, mandat, parseAddress) | 🟢 PASS — 141/141 |
| 14 | Aucune écriture Prisma dans la chaîne Lydie V2 | 🟢 PASS (vérification structurelle + lecture) |
| 15 | `route.ts` (schéma étendu) — compilation/exécution complètes | ⚪ NON VÉRIFIÉ (Next/Prisma/Zod non installables ici, 403 npm) — relu 👁️ |
| 16 | `npm run build` / `lint` / `vitest run` réels | ⚪ NON VÉRIFIÉ — BLOQUÉ PAR L'ENVIRONNEMENT (403 registre npm) |

## Sorties réelles des tests
Voir le journal horodaté ci-dessus (comptes exacts par fichier, aucun résultat arrondi ni supposé). Détail des 15 assertions ad hoc disponible sur demande (script `test-new-scenarios.js`, conservé dans le scratchpad de session).

## Fichiers modifiés
- `src/lib/lydie/engine.ts`
- `src/lib/lydie/orchestrator.ts`
- `src/lib/lydie/extraction.ts`
- `src/lib/lydie/resume.ts`
- `src/app/api/lydie/route.ts`

## Fichiers créés
- `src/lib/lydie/addressSuggestions.ts`
- `src/tests/unit/lydie-apostrophe-and-address-completion.test.ts`
- `src/tests/unit/lydie-address-suggestions.test.ts`
- `P2A1-RESULTATS.md` (ce fichier)
- `CHANGELOG-P2A1.md`

## Ce qui reste NON VÉRIFIÉ
- Appel réel à la Base Adresse Nationale avec de vraies données (réseau indisponible dans cet environnement — confirmé par `curl` : *CONNECT tunnel failed, response 403*, et par `WebFetch` : *ROBOTS_DISALLOWED*).
- Compilation/exécution complètes de `src/app/api/lydie/route.ts` (dépendances Next.js/Prisma/Zod non installables ici).
- Interface de sélection des suggestions d'adresse : non construite dans cette passe (décision de portée non tranchée seule — à valider avec l'utilisateur).
- `npm run build`, `npm run lint`, `npx vitest run`, `npx prisma generate` réels.
- Validation staging/Supabase.

## Vérification d'intégrité

| Élément | État |
|---|---|
| J20 (`src/state-machine/state-machine-engine.ts`) | **INCHANGÉ** — SHA-256 relevé, fichier non ouvert en écriture durant cette mission |
| `transitionDossierInTransaction()` / `assertGuards()` | **INCHANGÉS** — aucune modification, aucun contournement (recherche structurelle : seuls les appels déjà existants dans `route.ts` subsistent, non touchés) |
| Prisma (client, requêtes) | **INCHANGÉ** |
| `prisma/schema.prisma` | **INCHANGÉ** — SHA-256 relevé, fichier non ouvert |
| Mandat (3 consentements, `MANDAT_SIGNE`) | **INCHANGÉ** — aucune ligne touchée dans `resume.ts#buildMandatDocumentData` ni dans les conditions du mandat d'`engine.ts` |
| Optimistic locking (`Dossier.version`) | **INCHANGÉ** — aucun fichier concerné ouvert |
| Contournement de J20 | **AUCUN** — toute la logique nouvelle (apostrophes, fusion d'adresse, suggestions) reste dans `src/lib/lydie/*`, jamais appelée depuis ou vers `state-machine-engine.ts` |
