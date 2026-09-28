# P2B — Plan de passation

Document de préparation, écrit **sans aucune modification de code**. Référence : `P2A1-RESULTATS.md` / `CHANGELOG-P2A1.md` (Snapshot Officiel P2A.1, figé le 2026-09-27 21:33 Europe/Paris).

## 1. Ordre exact des prochaines tâches

L'ordre ci-dessous est une dépendance stricte : chaque tâche suppose la précédente terminée et validée (tests réels), pas seulement commencée.

1. **P2B.0 — Décision de portée UI (bloquant, non technique)**
   Décider avec l'utilisateur SI et COMMENT les suggestions d'adresse (`addressSuggestions.ts`, déjà écrit) doivent apparaître côté client (liste cliquable ? simple texte suggéré ? rien pour l'instant ?). Rien en P2B ne doit être codé avant cette décision : coder une UI sans decision validée reviendrait à trancher seul un choix produit, ce qui est explicitement interdit tout au long de cette mission.

2. **P2B.1 — Branchement de `addressSuggestions.ts` dans `route.ts`**
   Une fois P2B.0 tranché : exposer un point d'entrée (nouvelle route ou paramètre sur la route existante) qui appelle `fetchAddressSuggestions()` et renvoie le résultat au client, SANS jamais transmettre une suggestion à `stepLydie()` comme si le client l'avait tapée lui-même (voir `LYDIE-MEMORY-SPEC.md`, règle de remplacement). Dépend de P2B.0.

3. **P2B.2 — Interface client de sélection**
   Composant qui affiche les suggestions renvoyées par P2B.1 et, quand le client en choisit une, envoie son `label` comme un message normal à `stepLydie()` (donc réutilise `hasCompleteAddress()` sans changement). Dépend de P2B.1.

4. **P2B.3 — Vérification réseau réelle BAN**
   Dès qu'un environnement avec accès réseau sortant vers `api-adresse.data.gouv.fr` est disponible (poste local de l'utilisateur, ou environnement de déploiement — jamais ce sandbox), exécuter réellement `fetchAddressSuggestions()` contre une vraie requête et vérifier le parsing sur de vraies données (actuellement seul le parsing est testé avec un transport simulé — voir `TECH-DEBT-P2A1.md`, point 1). Peut être fait en parallèle de P2B.2, mais doit être fait avant toute déclaration de "PASS réel" sur ce module.

5. **P2B.4 — Cas particuliers BAN documentés dans `BAN-INTEGRATION-PLAN.md`**
   Une fois P2B.1-P2B.3 stables : traiter les cas "maison neuve non répertoriée" et "lieu-dit" (voir ce document) — décision produit à valider avant tout code, comme en P2B.0.

6. **P2B.5 — Exécution complète de `route.ts`**
   Seule tâche qui restera bloquée par l'environnement de développement actuel (Next.js/Prisma/Zod non installables ici, `npm ci` → 403). À faire dans un environnement où `npm install` fonctionne (poste local, CI, staging) — pas une tâche de conception, une tâche d'exécution.

## 2. Dépendances entre elles

```
P2B.0 (décision)
   └─▶ P2B.1 (branchement backend)
          └─▶ P2B.2 (UI sélection)
          └─▶ P2B.3 (vérif réseau réelle) ──┐
                                            ▼
                                     P2B.4 (cas particuliers)
                                            │
                                            ▼
                                     P2B.5 (exécution complète route.ts)
```

P2B.3 ne dépend PAS de P2B.2 (peut être vérifié dès que P2B.1 existe, indépendamment de l'UI) mais les deux doivent être terminées avant P2B.4.

## 3. Ce qui est déjà prêt (aucun travail restant)

- `normalize()` avec canonicalisation des apostrophes — aligné dans `engine.ts`, `orchestrator.ts`, `extraction.ts`. Testé réellement, 0 échec.
- `addressDraft` (fusion d'adresse multi-messages) — `engine.ts`, `resume.ts`, schéma Zod de `route.ts`. Testé réellement, 0 échec.
- `addressSuggestions.ts` — module complet, avec repli obligatoire, injectable pour les tests (`FetchLike`). Logique de parsing testée réellement (transport simulé) ; appel réseau réel non observable dans ce sandbox (voir `TECH-DEBT-P2A1.md`).
- Suites de tests dédiées (`lydie-apostrophe-and-address-completion.test.ts`, `lydie-address-suggestions.test.ts`), 17 tests, 0 échec.
- Les 5 documents Markdown de cette livraison P2B (préparation).

Aucune de ces briques n'a besoin d'être retouchée pour démarrer P2B.0 → P2B.5.

## 4. Ce qui ne doit surtout pas être touché

Liste inchangée depuis le début de cette mission — s'applique intégralement à P2B :

- `src/state-machine/state-machine-engine.ts` (J20), `transitionDossierInTransaction()`, `assertGuards()`.
- `prisma/schema.prisma`, le client Prisma, toute requête Prisma existante.
- La logique du mandat (3 consentements, `MANDAT_SIGNE`) dans `resume.ts#buildMandatDocumentData` et dans `engine.ts` (étape MANDAT).
- L'optimistic locking (`Dossier.version`).
- `parseAddress.ts` / `hasCompleteAddress()` / `ADDRESS_PATTERN` — le parseur d'adresse ne doit JAMAIS devenir plus permissif ; toute nouvelle fonctionnalité (suggestions, fusion) doit continuer à revalider via ce même parseur inchangé.
- La garantie que `stepLydie()` reste une fonction PURE (aucun accès réseau/DB) — c'est précisément pourquoi `addressSuggestions.ts` est appelé depuis la couche API (`route.ts`), jamais depuis `engine.ts`.
- L'architecture Lydie V2 (Orchestrateur → Extraction → Contexte → Reasoning) — seule sa fonction `normalize()` dupliquée a été alignée cette passe ; aucune autre modification n'est prévue en P2B sans nouvelle mission explicite.

Toute décision ambiguë touchant l'une de ces zones doit être signalée à l'utilisateur avant tout code, jamais tranchée seule — règle non négociable rappelée dans chaque livraison de cette mission.
