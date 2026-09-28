# OMEGA-DOC-LOCK-v1.md — Rapport final de verrouillage documentaire

Mission : « ORDRE DE MISSION — OMEGA DOCUMENTATION (AUTONOME) ». Exécution autonome, spec-first, **aucun fichier `.ts` en écriture, aucun changement Prisma, aucun changement J20, aucune modification de la State Machine, aucun PASS simulé.**

## Résumé exécutif

Les 7 livrables demandés ont été produits. Cette mission verrouille la gouvernance documentaire d'OMEGA en résolvant les 3 collisions d'identifiants identifiées par `CEO-AUDIT-OMEGA.md` (P0), en posant un pont explicite vision↔réel à 4 niveaux (Vision/Spécifié/Codé/Vérifié), en proposant — sans l'appliquer — une arborescence documentaire officielle, et en rédigeant 5 brouillons d'ADR fondateurs. Deux points restent explicitement non verrouillables en l'état, faute de matière fournie (`AR-011`) ou parce qu'il s'agit d'une collision de valeur de design, pas de nom (couleur d'accent) — signalés, pas devinés.

**Aucun code n'a été modifié, exécuté ou créé.** Tout le travail de cette mission est documentaire, conformément à la contrainte absolue.

## Fichiers créés ou mis à jour dans cette mission

| Fichier | Action |
|---|---|
| `BOOT.md` | Mis à jour (v2) — liens directs par catégorie (MASTER-RUNBOOK, RFC, ADR, REPORTS, TECH-DEBT, VISION) |
| `DOC-INDEX.md` | Mis à jour (v2) — colonne « Emplacement » ajoutée, brouillons ADR indexés |
| `VISION-TO-EXECUTION.md` | Mis à jour (v2) — reclassé selon Vision/Spécifié/Codé/Vérifié |
| `NOMENCLATURE-LOCK.md` | Créé — décisions de renommage verrouillées |
| `ARBORESCENCE-OFFICIELLE.md` | Créé — proposition de structure `docs/{boot,rfc,adr,reports,tech-debt,vision,academy,passation}/`, non appliquée |
| `adr-drafts/ADR-001-lydie-entree-unique.md` | Créé — brouillon |
| `adr-drafts/ADR-002-un-dossier-unique-par-projet.md` | Créé — brouillon |
| `adr-drafts/ADR-003-pole-specialise-prend-le-relais.md` | Créé — brouillon, résout la collision `LAP-001` |
| `adr-drafts/ADR-004-por-001-obligatoire.md` | Créé — brouillon |
| `adr-drafts/ADR-005-un-identifiant-un-document.md` | Créé — brouillon, formalise `NOMENCLATURE-LOCK.md` |
| `IDENTIFIANTS-RENOMMAGE.md` | Mis à jour — note de supersession ajoutée en tête (conservé comme analyse historique) |
| `OMEGA-DOC-LOCK-v1.md` | Créé — ce rapport |

**Aucun fichier `.ts` touché. Aucun fichier Prisma/J20/State Machine touché** — confirmé par le fait qu'aucun outil d'écriture n'a été invoqué sur un chemin `src/**/*.ts`, `prisma/**`, ou `src/state-machine/**` pendant cette mission (seules des lectures avaient eu lieu lors des missions précédentes, aucune cette fois-ci).

## Renommages proposés (verrouillés dans `NOMENCLATURE-LOCK.md`)

- `LAP-001` → conserve son sens Asset Pack uniquement ; le principe de relais devient `ADR-003`.
- `LMP-001` → conserve son sens Motion Pack uniquement ; le sujet mémoire reste `LYDIE-MEMORY-SPEC.md`, sans nouveau code produit.
- Version conceptuelle de `TECH-DEBT-P2A1.md` → renommée par anticipation en `TECH-DEBT-VISION-ARISTOTE-ONE.md` si elle est un jour versée au dépôt.

## P0 résolus

- **Collision `TECH-DEBT-P2A1.md`** — verrouillée : le fichier réel (156 vérifications) reste seul propriétaire du nom.
- **Collision `LMP-001`** — verrouillée : Motion Pack uniquement.
- **Collision `LAP-001`** — verrouillée : Asset Pack uniquement, le second sens reclassé en `ADR-003`.
- **Absence de RFC/ADR/BOOT.md réels** — partiellement résolue : `BOOT.md` est désormais un fichier réel ; 5 brouillons d'ADR fondateurs existent (`adr-drafts/`) ; les RFC restent à créer (aucune matière fournie pour leur numérotation — non inventée).

## P1

- **Passerelle MASTER-RUNBOOK ↔ PASSATION OFFICIELLE** : toujours non tranchée — `VISION-TO-EXECUTION.md` §4 liste 3 zones grises d'architecture (J20 vs Kernel, Prisma vs multi-entreprises, `engine.ts` vs agent AIP) en attente d'arbitrage par Aristote.
- **Arborescence `docs/`** : une proposition unique existe désormais (`ARBORESCENCE-OFFICIELLE.md`), mais elle n'est pas appliquée, et certains fichiers nommés par `MASTER-RUNBOOK-V1` (`LZ-000`, `PB-001`, `ADN-001`, …) n'ont pas de dossier de catégorie évident dans cette structure — classement à trancher une fois la structure validée.
- **Gabarit ADR** : les 5 brouillons de cette mission suivent un format cohérent (Statut/Contexte/Décision/Justification/Conséquences/Traçabilité) qui peut servir de gabarit de fait pour les futurs `ADR-0001`…`ADR-0006` mentionnés par `MASTER-RUNBOOK-V1` — proposition implicite, non formellement validée comme gabarit officiel.

## P2

- Incohérence de couleur d'accent (`#1E88E5` vs `#27C2FF`) — signalée, non tranchée (collision de valeur, pas de nom).
- Deux copies strictement identiques de `PASSATION OFFICIELLE` reçues — sans conséquence, signalé pour mémoire.
- Mécanisme concret de gestion des secrets (Stripe/OpenAI/Email) — principe rappelé, pas de solution technique proposée (hors périmètre documentaire de cette mission).

## Risques restants

- Les 5 ADR de cette mission sont des **brouillons rédigés sur instruction directe d'Aristote**, mais n'ont pas encore été formellement consignés dans un `DECISION-LOG.md` (qui reste à créer) — tant que ce dernier n'existe pas, la traçabilité formelle des décisions repose uniquement sur cette conversation et sur les fichiers eux-mêmes.
- `AR-011` reste totalement non défini — tout document futur qui l'emploierait sans définition préalable réintroduirait immédiatement une ambiguïté du même type que celles qui viennent d'être résolues.
- La classification « Vérifié » de `VISION-TO-EXECUTION.md` s'appuie sur les tests déjà exécutés lors des missions précédentes (156 vérifications) — aucune nouvelle exécution n'a eu lieu dans cette mission, purement documentaire ; cette classification reste donc exacte tant que le code sous-jacent n'a pas changé depuis.
- L'arborescence `docs/` proposée n'a de valeur que documentaire jusqu'à validation explicite — tant qu'elle reste non appliquée, tout nouveau document créé en pratique doit continuer d'indiquer explicitement son emplacement réel dans `DOC-INDEX.md`, comme fait dans cette mission.

## Ce qui sera prêt pour reprendre les sprints

- Gouvernance documentaire cohérente : un point d'entrée (`BOOT.md`), un index à jour (`DOC-INDEX.md`), une nomenclature verrouillée (`NOMENCLATURE-LOCK.md`), un pont vision/réel classé (`VISION-TO-EXECUTION.md`).
- `P2B-PLAN.md` reste la feuille de route technique immédiate (P2B.0 → P2B.5), non modifiée par cette mission, toujours valide.
- Les 5 brouillons d'ADR fondateurs offrent un cadre de décision pour les premiers choix d'architecture qui se poseront dès que le développement touchera à l'articulation Lydie/pôles spécialisés — sans obligation de les appliquer avant leur validation formelle.
- Aucune dette supplémentaire créée par cette mission : tous les livrables sont additifs (nouveaux fichiers ou mises à jour de fichiers déjà en préparation), aucun fichier réel de code n'a été touché.
