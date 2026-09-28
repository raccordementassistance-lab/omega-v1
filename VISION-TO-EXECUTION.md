# VISION-TO-EXECUTION.md — Pont entre la vision Aristote One et l'état réel du dépôt

Document de préparation, **aucun code modifié par ce document**. Objectif : établir, concept par concept, ce qui existe réellement et testé dans ce dépôt aujourd'hui, face à ce que décrit `PASSATION OFFICIELLE — ARISTOTE ONE OMEGA v1` (pièce conceptuelle, non intégrée). Ce document ne tranche aucune décision d'architecture — il rend la comparaison possible pour que la décision (arbitrage humain) soit informée.

**Version** : v2 — classification reprise selon les 4 niveaux demandés par la mission « OMEGA DOCUMENTATION (AUTONOME) » : **Vision → Spécifié → Codé → Vérifié**.

## 1. Échelle de classification (4 niveaux, cumulatifs)

Chaque concept est classé au niveau **le plus avancé qu'il a réellement atteint** — jamais supposé au niveau suivant sans preuve :

1. **Vision** — mentionné dans une pièce conceptuelle (`PASSATION OFFICIELLE`, `MASTER-RUNBOOK-V1`), aucune spécification détaillée, aucun code.
2. **Spécifié** — une spécification écrite existe (dans une pièce reçue ou dans un document réel de ce dépôt), suffisamment précise pour être implémentée, mais aucun code ne l'implémente encore.
3. **Codé** — du code existe réellement dans ce dépôt et implémente le concept, mais n'a pas été exécuté/testé dans cette session (relu uniquement, 👁️), ou l'a été partiellement.
4. **Vérifié** — du code existe et a été **réellement exécuté** avec un résultat observé (test unitaire réel, exécution ad hoc réelle) — jamais une exécution supposée.

Un concept qui n'atteint aucun de ces 4 niveaux (aucune pièce ne le mentionne) n'apparaît pas dans ce tableau.

## 2. Ce qui existe réellement dans ce dépôt aujourd'hui (rappel, base de comparaison)

- Un moteur conversationnel déterministe pour **un seul métier** (raccordement électrique) : `src/lib/lydie/engine.ts` (`stepLydie`), fonction pure, sans réseau ni base de données.
- Une state machine à 15 états gouvernant **un seul type d'objet** (`Dossier`) : `state-machine-engine.ts`, avec verrouillage optimiste (`Dossier.version`) et guards (`assertGuards`).
- Un schéma Prisma centré sur `Dossier` / `Demande` / `Document` / `Adresse` — pas de notion d'entreprise multiple, de mission générique, ni d'agent générique.
- Un service optionnel d'autocomplétion d'adresse (`addressSuggestions.ts`, BAN), non encore branché à l'UI.
- Une architecture Lydie V2 parallèle (`orchestrator.ts`/`extraction.ts`/`context.ts`/`reasoning.ts`), pas branchée en production.
- Une discipline de preuve (rapports type `P2A1-RESULTATS.md`, tableaux PASS/FAIL/NON VÉRIFIÉ, journaux d'exécution horodatés) — déjà appliquée depuis le début de cette mission, désormais formalisée sous le nom `POR-001` (`ADR-004`, brouillon).

## 3. Table de classification

| Concept de la vision (« Aristote One ») | Niveau | Détail |
|---|---|---|
| Kernel unique (MissionEngine, AgentRegistry, MemoryEngine, ProofValidator, AuditLogger) | **Vision** | Nommé et rôle décrit dans `PASSATION OFFICIELLE` §7 ; aucune spécification de champs/interfaces, aucun code. |
| AIP — bus d'événements central | **Vision** | Structure de mission (MISSION_ID/CONTEXTE/OBJECTIF/…) et catalogue d'événements nommés dans `PASSATION OFFICIELLE` §6, mais sans schéma de données précis (types de champs, format de sérialisation) — pas encore une spécification implémentable telle quelle. |
| Agent « Lydie » (relation client) | **Vérifié** (pour son périmètre réel actuel) | `engine.ts` (`stepLydie`) : codé et vérifié par 44+10 tests réels. Le rôle « agent IA généraliste » de la vision (personnalité, permissions, journal, comme décrit pour Olympus) reste au niveau **Vision** — non spécifié pour Lydie elle-même. |
| Agents Atlas / Hermès / Mercure / Argentum / Orion / Olympus | **Vision** | Mission et exemples de contenu décrits (`PASSATION OFFICIELLE` §10-15), aucune spécification technique (champs, API, format des données), aucun code. |
| World Engine (France → Région → Département → Commune) | **Vision** | Structure hiérarchique nommée (`PASSATION OFFICIELLE` §9), aucun schéma de données précis, aucun code. `parseAddress.ts` (réel, **Vérifié**) valide un texte libre en 4 composants plats, sans hiérarchie géographique — ne doit pas être confondu avec le World Engine, qui reste un concept distinct et non spécifié. |
| Mission Control (vue client) | **Spécifié**, partiellement | Statuts listés explicitement (`PASSATION OFFICIELLE` §8 : Nouveau/En préparation/En attente/Prêt/Transmis/Terminé) — assez précis pour être une base de spécification. Correspondance avec le code réel (Module 6 Espace client, mentionné dans le contexte du projet) **non vérifiée dans cette passe** (aucune relecture de ce module effectuée) — donc pas classé plus haut que **Spécifié** par prudence. |
| Argentum / Stripe / tarifs 59 € / 59 € / 80 € | **Spécifié** | Tarifs et produits précisément chiffrés (`PASSATION OFFICIELLE` §13, §8) — assez précis pour être implémenté. Aucune correspondance avec le schéma Prisma réel vérifiée dans cette passe (aucune lecture de `schema.prisma` effectuée, conformément à l'économie de moyens d'une passe purement documentaire). |
| Base de données ~40 tables | **Vision** | Liste des blocs principaux et convention de préfixes (`PASSATION OFFICIELLE` §17), mais pas un schéma de champs table par table — insuffisant pour être qualifié de « Spécifié » au sens strict. Aucun code. |
| POR-001 (rapport de preuves obligatoire) | **Vérifié** | Le principe est non seulement spécifié mais déjà appliqué et vérifié dans les faits depuis le début de cette mission (`P2A1-RESULTATS.md` et tous les rapports suivants) — seul le nom restait à aligner, fait via `ADR-004` (brouillon). |
| `addressDraft` (mémoire de fusion d'adresse multi-messages) | **Vérifié** | `engine.ts` + `LYDIE-MEMORY-SPEC.md`, 10 tests réels dédiés. Aligné avec `MASTER-RUNBOOK-V1` §3 — aucun écart. |
| Autocomplétion BAN (suggestions d'adresse) | **Codé**, partiellement **Vérifié** | `addressSuggestions.ts` : logique de parsing et de repli vérifiée par 7 tests réels ; l'appel réseau réel contre de vraies données BAN reste **Codé** seulement (non exécutable dans cet environnement — proxy sortant bloqué), pas Vérifié pour ce cas précis. |
| Design System — palette et composants | **Vision** / **Spécifié** selon l'élément | Palette Asset Pack (`LAP-001`) chiffrée précisément → **Spécifié**. Composants (`GlassCard`, `HaloCard`, `ProgressRing`, …) nommés sans détail d'implémentation → **Vision**. Aucun code pour aucun composant. **Incohérence non résolue** : deux couleurs d'accent différentes selon la source (`#1E88E5` vs `#27C2FF`) — signalée dans `NOMENCLATURE-LOCK.md` §6, non tranchée ici. |
| Lydie ouvre la mission / le pôle spécialisé prend le relais | **Spécifié** | Formalisé dans `ADR-003` (brouillon) — principe déjà partiellement observable dans le code réel (Lydie qualifie, J20 gouverne les transitions) mais jamais explicité comme règle générale avant cette ADR. |

## 4. Zones grises — décisions business non tranchées ici

Ce document se limite à constater les écarts ; les choix suivants appartiennent à l'utilisateur, jamais à Claude seul :

1. **La vision Aristote One doit-elle, à terme, englober J20** (J20 devenant un module du futur Kernel), **ou rester un chapeau ajouté sans toucher à J20** ? Cette question détermine si tout développement futur du Kernel/AIP touche ou non aux fichiers protégés de J20.
2. **Le schéma Prisma actuel doit-il être étendu vers les ~40 tables de la vision, ou une base séparée doit-elle être créée** pour les futures entreprises (Enterprise Factory) sans toucher au schéma actuel ? Question directement liée à l'invariant « Prisma ne change pas ».
3. **`engine.ts` (Lydie réelle) doit-il devenir, tel quel, « l'agent Lydie » sous AIP, ou une nouvelle couche d'agent doit-elle envelopper `stepLydie()` sans le modifier ?** Le deuxième choix préserverait la garantie de pureté déjà exploitée par toute la suite de tests.
4. **Incohérence de couleur d'accent** (§3, Design System) : `#1E88E5` vs `#27C2FF` — laquelle est officielle, ou les deux coexistent-elles pour des échelles différentes (Lydie vs Aristote One global) ? Signalé dans `NOMENCLATURE-LOCK.md` §6.

## 5. Ce que ce document ne fait pas

- Il ne décide aucune des 4 zones grises du §4 — il les signale pour arbitrage.
- Il ne crée, ne modifie ni n'exécute aucun code, aucun schéma Prisma, aucune transition J20.
- Il ne valide pas la vision « Aristote One » comme feuille de route certaine — voir `CEO-AUDIT-OMEGA.md` pour les réserves déjà formulées sur ces pièces.
