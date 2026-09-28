# BOOT.md — Point d'entrée unique

Ce fichier est le point d'entrée unique du dépôt `J20-LydieIA-OMEGA` / Raccordement Assistance. Toute personne (ou tout Claude) qui ouvre ce dépôt pour la première fois commence ici, avant tout autre document.

**Version** : v2 — mise à jour dans le cadre de la mission « OMEGA DOCUMENTATION (AUTONOME) », verrouillage de la gouvernance documentaire avant reprise des sprints. Remplace la v1 (créée juste avant cette mission) en y ajoutant les liens directs par catégorie et la référence au verrouillage de nomenclature.

## 0. Ce que tu es ici pour faire

Tu n'es pas ici pour concevoir l'architecture ou trancher une ambiguïté business seul. Tu es ici pour :
- lire ce qui existe réellement (ce fichier → `DOC-INDEX.md` → les documents réels qu'il référence) ;
- exécuter la prochaine tâche déjà validée (`P2B-PLAN.md`) ;
- fournir des preuves réelles pour toute déclaration de PASS (voir `docs/POR-001.md`, à créer — principe déjà appliqué dans les rapports réels) ;
- signaler, jamais trancher seul, toute ambiguïté touchant une décision business ou un fichier protégé.

## 1. Invariants non négociables (rappel, valables pour tout ce dépôt)

- **J20 reste l'autorité métier** (`src/state-machine/state-machine-engine.ts`, `transitionDossierInTransaction()`, `assertGuards()`) — jamais contourné, jamais modifié sans un format « stop-and-report » explicite.
- **Prisma ne change pas** (`prisma/schema.prisma`, client, requêtes) sans décision explicite de l'utilisateur.
- **Le Mandat (3 consentements, `MANDAT_SIGNE`) ne change pas.**
- **L'optimistic locking (`Dossier.version`) ne change pas.**
- **`parseAddress.ts` / `hasCompleteAddress()` / `ADDRESS_PATTERN` ne deviennent jamais plus permissifs.**
- **Aucun PASS sans exécution réelle.** Chaque affirmation porte un label explicite : 🟢 TESTÉ RÉELLEMENT / 👁️ VÉRIFIÉ PAR LECTURE / ⚪ NON VÉRIFIÉ / BLOQUÉ PAR L'ENVIRONNEMENT.
- **Aucun commit / publication / déploiement sans approbation explicite.**
- **Toute ambiguïté business est signalée, jamais résolue silencieusement.**
- **Un identifiant = un seul document** (voir `NOMENCLATURE-LOCK.md`, et son projet de formalisation `ADR-005`).

## 2. Ordre de lecture officiel

1. **`BOOT.md`** (ce fichier) — invariants et point d'entrée.
2. **`DOC-INDEX.md`** — liste complète de tous les documents du projet, avec statut, propriétaire, dépendances et emplacement.
3. **`NOMENCLATURE-LOCK.md`** — verrouillage des identifiants ; à consulter avant d'utiliser `LAP-001`, `LMP-001`, `TECH-DEBT-P2A1.md`, ou tout identifiant du type `AR-0xx`.
4. **`VISION-TO-EXECUTION.md`** — le pont entre la vision « Aristote One » (Kernel, AIP, agents) et l'état réel du dépôt, avec classification Vision / Spécifié / Codé / Vérifié pour chaque concept.
5. **`P2A1-RESULTATS.md`** et **`CHANGELOG-P2A1.md`** — Snapshot Officiel P2A.1 STABLE, référence technique actuelle (156 vérifications réellement exécutées, 0 échec).
6. **`P2B-PLAN.md`** — prochaines tâches, dans l'ordre, avec leurs dépendances et ce qui ne doit pas être touché.
7. **`ARBORESCENCE-OFFICIELLE.md`** — proposition de structure de dossiers (`docs/boot/`, `rfc/`, `adr/`, `reports/`, `tech-debt/`, `vision/`, `academy/`, `passation/`), non appliquée tant qu'elle n'est pas validée.
8. **`CEO-AUDIT-OMEGA.md`** — audit des pièces de vision « Aristote One » reçues, avec réserves.
9. **`OMEGA-DOC-LOCK-v1.md`** — rapport final du verrouillage documentaire (cette mission).

## 3. Liens directs par catégorie

| Catégorie | Documents | Statut |
|---|---|---|
| **MASTER-RUNBOOK** | `MASTER-RUNBOOK-V1` (mission P2B.1-A/B, UI LV1, POR-001, Snapshot) | conceptuel — reçu, cohérent avec le réel, non encore copié dans le dépôt sous ce nom (voir `DOC-INDEX.md` §2) |
| **RFC** | Aucun fichier RFC reçu ni créé à ce jour | à créer — numérotation et dépendances non définies (voir `CEO-AUDIT-OMEGA.md` §2.3) |
| **ADR** | Brouillons `ADR-001` à `ADR-005` dans `adr-drafts/` (cette mission) ; `ADR-0001` à `ADR-0006` mentionnés par `MASTER-RUNBOOK-V1` sans contenu | brouillons réels (proposés) pour les 5 premiers ; à créer pour les 6 autres |
| **REPORTS** | `P2A1-RESULTATS.md`, `CHANGELOG-P2A1.md`, `CEO-AUDIT-OMEGA.md`, `OMEGA-DOC-LOCK-v1.md` | réels |
| **TECH-DEBT** | `TECH-DEBT-P2A1.md` (référence officielle, 156 vérifications réelles) ; version conceptuelle reçue, à renommer avant toute intégration (voir `NOMENCLATURE-LOCK.md`) | réel (référence) + conceptuel (en attente de renommage) |
| **VISION** | `VISION-TO-EXECUTION.md` (réel), `PASSATION OFFICIELLE — ARISTOTE ONE OMEGA v1` (conceptuel) | mixte — voir tableau de classification dans `VISION-TO-EXECUTION.md` |

## 4. Cohérence avec la gouvernance

Ce fichier ne remplace, ne réinterprète et ne complète aucune règle déjà en vigueur dans cette mission — il ne fait que les rassembler à un seul endroit, comme point de départ. Toute règle plus détaillée reste dans son document d'origine (`P2B-PLAN.md` §4 pour la liste exhaustive des fichiers protégés, `CEO-AUDIT-OMEGA.md` pour les réserves sur la vision « Aristote One »).

## 5. Ce que ce fichier ne fait pas

- Il ne décide pas si la vision « Aristote One » (Kernel/AIP/agents) doit remplacer, englober ou rester séparée de l'architecture réelle actuelle — voir `VISION-TO-EXECUTION.md` §4 (zones grises, décision business en attente).
- Il n'applique aucune arborescence de dossiers — voir `ARBORESCENCE-OFFICIELLE.md`, proposition non appliquée.
- Il ne modifie, ne crée et n'exécute aucun code. Cette livraison reste strictement documentaire.
