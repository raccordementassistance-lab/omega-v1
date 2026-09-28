# P2B.1-EXECUTION.md — Rapport d'exécution

Mission : « Mission suivante : P2B.1 — rendre Lydie plus naturelle sans casser J20 ». Contraintes inchangées : POR-001, spec-first, pas de modification Prisma hors nécessité démontrée, pas de changement de State Machine sans justification, preuves obligatoires.

Les 5 priorités demandées sont traitées une par une ci-dessous : celles qui appelaient un vrai changement de code (priorité 2) sont livrées avec preuve réelle ; celles qui ne relèvent pas d'un correctif de code sans décision métier préalable (priorités 3, 4, 5) sont **signalées, pas tranchées silencieusement** — conformément à la discipline déjà appliquée dans les missions précédentes (« Si un point est non vérifiable, indique-le explicitement au lieu de le supposer »).

## Fichiers modifiés

| Fichier | Nature du changement |
|---|---|
| `src/lib/lydie/engine.ts` | Ajout de `ADDRESS_SEARCH_PATTERN` (variante non ancrée de `ADDRESS_PATTERN`) et de `findEmbeddedAddress()` ; détection d'une adresse déjà présente dans le même message que le projet, aux étapes `MODE` et `PROJECT` ; ajout de la constante partagée `DETAILS_QUESTION` (élimine une chaîne dupliquée à 3 endroits). Priorité 2. |
| `src/tests/unit/lydie-engine.test.ts` | +6 tests réels couvrant la détection composite projet+adresse (MODE et PROJECT), les non-régressions (message sans adresse, adresse incomplète non acceptée comme un faux positif) et la continuité du parcours jusqu'à SUMMARY après un saut composite. |

**Aucun fichier Prisma touché. Aucun fichier J20/State Machine touché. Aucun ADR requis** — aucune décision d'architecture nouvelle sur J20 ou la State Machine n'a été prise cette passe.

## Traitement des 5 priorités

### 1. Une seule question à la fois

👁️ **VÉRIFIÉ PAR LECTURE — déjà garanti par construction, aucun changement nécessaire.** `stepLydie()` est une fonction pure qui retourne toujours exactement un seul `reply` par appel (voir la signature de `LydieResult` et chaque branche du `switch (context.step)`) — il n'existe aucun chemin qui empile plusieurs questions dans une même réponse. Cette exigence était donc déjà satisfaite avant P2B.1 ; le seul risque real aurait été d'introduire une régression en ajoutant la détection composite de la priorité 2 (ex. poser à la fois la question DETAILS et redemander l'adresse) — écarté explicitement par les tests de non-régression ajoutés (voir preuves ci-dessous).

### 2. Aucune répétition des informations déjà connues

🟢 **TESTÉ RÉELLEMENT — livré cette passe.** Cas traité : le client donne son projet ET son adresse complète dans le même message (dès le premier message, étape `MODE`, ou dans un message ultérieur, étape `PROJECT`). Auparavant, le moteur ignorait totalement l'adresse présente dans ce message et redemandait « Quelle est l'adresse exacte du projet ? » — une répétition, puisque l'information avait déjà été donnée.

Méthode (voir commentaire détaillé dans `engine.ts`) :
- `ADDRESS_SEARCH_PATTERN` est une variante **non ancrée** de `ADDRESS_PATTERN`, utilisée uniquement pour repérer un candidat d'adresse à l'intérieur d'un message plus long.
- `findEmbeddedAddress(text)` applique ce motif, puis **revalide systématiquement le candidat trouvé avec `hasCompleteAddress()` inchangée** (donc avec `ADDRESS_PATTERN` ancré, lui-même jamais modifié) avant de l'accepter — même principe de double validation que `buildAddressMergeCandidates()` (P2A.1), déjà en place pour la recomposition d'adresse multi-messages.
- Si (et seulement si) une adresse complète est trouvée ET validée dans le message qui contient aussi le projet, le contexte saute directement à `DETAILS` (adresse renseignée, `addressDraft: null`) au lieu de repasser par `ADDRESS`.
- Si aucune adresse complète n'est trouvée (absente, ou présente mais incomplète), le comportement est **strictement inchangé** : la question d'adresse normale est posée.

Ce choix (une extension additive et étroitement bornée, plutôt que le branchement de l'architecture Lydie V2/orchestrator déjà construite en parallèle) est délibéré et signalé : `orchestrator.ts`/`extraction.ts` auraient pu couvrir ce cas plus largement, mais leur câblage en production reste une zone grise ouverte (`VISION-TO-EXECUTION.md` §4.3) qui dépasse le périmètre de cette mission — non tranchée ici.

### 3. Reprise naturelle d'une conversation interrompue

⚪ **NON RÉSOLU — signalé, pas corrigé, faute de décision métier/architecture préalable.** Deux constats réels, distincts, identifiés par lecture attentive du code existant :

- **a. Perte de données avant authentification.** Rien n'est persisté côté serveur tant que `finalizeLydieQualification()` (dans `route.ts`) n'a pas été exécutée — c'est-à-dire tant que le client n'est pas authentifié. Si un client complète tout le parcours de qualification sans compte, puis perd son `localStorage` (changement d'appareil, navigation privée, cache vidé) avant de se connecter, ses réponses sont définitivement perdues : rien ne les protège en base. Corriger cela demanderait un enregistrement intermédiaire (brouillon de qualification), donc une **modification Prisma** — explicitement hors périmètre sans nécessité démontrée par cette mission. Signalé, non corrigé.
- **b. Le widget « Parler à Lydie » (`src/app/espace-client/dossiers/[id]/page.tsx`) n'envoie jamais de `context` à `/api/lydie`.** Combiné à `deriveLydieContextFromDossier()` (dans `route.ts`), tout message envoyé via ce widget une fois qu'une `Demande` existe sur le dossier retombe systématiquement sur `case "DONE"` (« Votre dossier est déjà créé et confirmé... »). Ce widget ne peut donc pas reprendre une qualification interrompue une fois celle-ci finalisée — mais il fonctionne correctement pour reprendre à l'étape `PROJECT` si le dossier n'a encore aucune `Demande`. Je n'ai **pas** déterminé si ce comportement est un bug ou un choix intentionnel (le widget pourrait être pensé comme un canal de questions post-qualification, pas comme une reprise de parcours) : cette distinction est une décision de périmètre produit, pas une décision technique — signalée, non tranchée.

`deriveLydieContextFromDossier()` (donc `resume.ts`) couvre déjà, elle, la reprise multi-appareils **après** authentification pour un dossier sans `Demande` — ce mécanisme existant n'a pas été modifié et reste correct (7/7 tests `lydie-resume.test.ts` toujours au vert, voir Preuves).

### 4. Réutilisation intelligente du Dossier Unique

⚪ **NON RÉSOLU — signalé, pas construit, faute de spécification.** Aucun document de cette mission (`LYDIE-MEMORY-SPEC.md`, `P2B-PLAN.md`, `VISION-TO-EXECUTION.md`) ne définit précisément ce que « réutilisation intelligente » doit couvrir concrètement : réutiliser les informations d'un dossier existant pour pré-remplir une nouvelle demande du même client ? Retrouver un dossier existant plutôt que d'en ouvrir un nouveau si l'adresse correspond déjà à un dossier en cours ? Ces deux lectures ont des implications Prisma et State Machine très différentes, et aucune n'est tranchée dans les spécifications disponibles. Je n'ai construit aucun comportement sur cette priorité, pour ne pas trancher silencieusement une question métier qui devrait l'être explicitement par vous.

### 5. Transition fluide vers Pluri Raccordé

👁️ **VÉRIFIÉ PAR LECTURE — déjà techniquement manifestée, mais un point de nomenclature reste ouvert (non tranché ici).** Par votre clarification officielle : « Pluri Raccordé® est le Pôle 1 officiel d'Aristote... ce n'est pas une fonctionnalité technique, c'est un concept métier. » La manifestation technique existante de ce handoff est déjà en place et non modifiée cette passe : `finalizeLydieQualification()` crée le `Dossier` unique, l'`Adresse`, la `Demande`, le document de mandat, et transitionne `NOUVEAU → QUALIFICATION → DOSSIER_EN_PREPARATION` via `transitionDossierInTransaction` (J20, protégé, non touché). C'est ce même mécanisme qui EST le passage de relais.

Point resté ouvert, volontairement non tranché ici : aucune réponse de `stepLydie()` ne mentionne aujourd'hui « Pluri Raccordé » par son nom (le récapitulatif et le message final restent génériques, ex. « votre demande est confirmée »). Nommer explicitement « Pluri Raccordé » dans le texte affiché au client est une **décision de contenu/produit** (est-ce souhaitable dès la confirmation Lydie, ou seulement plus loin dans le parcours, une fois le Dossier créé ?) — pas une décision que je prends unilatéralement en modifiant les chaînes de `engine.ts`. Signalé pour arbitrage.

## Preuves

### Typecheck (scope : `src/lib/lydie/*.ts` + `src/tests/unit/lydie-*.test.ts`)

Vérification réelle par `tsc` scoping (même méthode que P2A.1/P2B.0 — `npm ci`/`npx tsc` directs restent bloqués, 403 sur le registre npm) :

```
$ tsc -p tsconfig.json
→ EXIT 0 — 0 erreur
```

🟢 **TESTÉ RÉELLEMENT.**

### Tests unitaires réels (priorité 2 + non-régression complète de la couche Lydie)

Exécution réelle via le shim `describe/it/expect` (adossé à `node:assert`, `vitest` non installable ici) :

```
lydie-address-suggestions.test.js               → 7 passed, 0 failed
lydie-address.test.js                            → 15 passed, 0 failed
lydie-apostrophe-and-address-completion.test.js  → 11 passed, 0 failed
lydie-engine.test.js                             → 50 passed, 0 failed   (44 → 50 : +6 nouveaux tests, priorité 2)
lydie-mandat-materialization.test.js             → 5 passed, 0 failed
lydie-orchestrator.test.js                        → 22 passed, 0 failed
lydie-orchestrator-v2.test.js                     → 31 passed, 0 failed
lydie-resume.test.js                              → 7 passed, 0 failed
```

**Total : 148 vérifications réellement exécutées, 0 échec** (142 précédemment + 6 nouveaux tests pour la détection composite projet+adresse).

🟢 **TESTÉ RÉELLEMENT.**

### Lint / Build

⚪ **NON VÉRIFIÉ — BLOQUÉ PAR L'ENVIRONNEMENT.** `npm run lint` et `npm run build` nécessitent `node_modules` (ESLint, Next.js), non installables ici (`npm ci`/`npm install` → 403 sur `registry.npmjs.org`, reconfirmé cette passe). Blocage structurel identique depuis le début de cette mission, pas une régression propre à cette passe.

## Limites restantes

- **Priorités 3, 4 et 5 non résolues par du code** — chacune documentée ci-dessus avec la raison précise (modification Prisma non justifiée sans décision explicite, spécification manquante, ou décision de contenu/produit non prise unilatéralement). Ce sont les points à trancher avant tout sprint qui voudrait les couvrir réellement.
- **Le câblage éventuel de Lydie V2 (`orchestrator.ts`/`extraction.ts`) reste une zone grise ouverte** (`VISION-TO-EXECUTION.md` §4.3), non refermée par cette mission — la priorité 2 a été résolue par une extension étroite d'`engine.ts` plutôt que par ce câblage plus large, pour rester dans le périmètre « pas de refactoring hors périmètre ».
- **`route.ts`, `adresse-suggestions/route.ts` et `chat/page.tsx` jamais compilés en conditions Next réelles** — inchangés cette passe, limite déjà documentée en P2A.1/P2B.0, toujours valable (dépendance à `node_modules`, non installable ici).
- **La détection composite reste un motif regex, pas une compréhension du langage** — un message où le projet et l'adresse sont formulés dans un ordre inhabituel ou avec des tournures non couvertes par `ADDRESS_SEARCH_PATTERN` continuera, correctement, à retomber sur le comportement existant (redemander l'adresse) plutôt que d'inventer une extraction hasardeuse — limite assumée, cohérente avec la nature déterministe du moteur (voir l'en-tête de `engine.ts`).

## Prochain sprint

Avant de coder toute suite à P2B.1, les décisions suivantes doivent être arbitrées (aucune n'est tranchée dans ce rapport) :
1. **Priorité 3.a** (perte de données pré-authentification) : la nécessité d'un enregistrement Prisma intermédiaire est-elle validée ? Si oui, cela devient une mission avec justification Prisma explicite, pas une extension d'`engine.ts`.
2. **Priorité 3.b** (widget « Parler à Lydie ») : son rôle est-il de reprendre une qualification interrompue, ou uniquement de répondre à des questions post-qualification ? Cette réponse détermine s'il s'agit d'un bug à corriger ou d'un comportement voulu.
3. **Priorité 4** : quelle définition précise donner à « réutilisation intelligente du Dossier Unique » (pré-remplissage, détection de doublon, autre) ?
4. **Priorité 5** : le nom « Pluri Raccordé » doit-il apparaître explicitement dans les réponses de Lydie, et à partir de quelle étape du parcours ?

Une fois ces points arbitrés, ils pourront former la base d'un P2B.2 avec le même niveau de preuve (typecheck + tests réels, aucun PASS simulé).
