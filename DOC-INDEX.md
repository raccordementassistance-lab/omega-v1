# DOC-INDEX.md — Index de tous les documents du projet

Document de préparation, **aucun code modifié par ce document**. Liste exhaustive de tous les documents connus à ce jour — réels, conceptuels, ou à créer — avec statut, propriétaire, dépendances et **emplacement**.

**Version** : v3 — mise à jour dans le cadre du Master Backlog (`ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md`), après P2B.2/P3.0/P3.1.

**Statuts utilisés** :
- **réel** — le fichier existe physiquement dans ce dépôt, avec un contenu fondé sur du code/des tests réellement exécutés ou sur une analyse par lecture explicitement labellisée comme telle.
- **brouillon** — le fichier existe physiquement, rédigé sur instruction directe d'Aristote, mais en attente de validation formelle (cas des ADR de cette mission).
- **conceptuel** — reçu (message, pièce jointe) mais jamais copié dans le dépôt ; décrit une intention, pas un état vérifié du code.
- **à créer** — nom mentionné dans une pièce conceptuelle, mais ni le fichier ni son contenu n'existent nulle part encore.

## 1. Documents réels (dans le dépôt)

| Document | Statut | Propriétaire | Dépendances | Emplacement |
|---|---|---|---|---|
| `BOOT.md` | réel (v2) | Claude (rédaction), validation Aristote en attente | `DOC-INDEX.md`, `NOMENCLATURE-LOCK.md`, `VISION-TO-EXECUTION.md` | `/home/claude/omega/BOOT.md` |
| `DOC-INDEX.md` | réel (v2, ce fichier) | Claude (rédaction), validation Aristote en attente | Tous les documents listés ci-dessous | `/home/claude/omega/DOC-INDEX.md` |
| `VISION-TO-EXECUTION.md` | réel (v2) | Claude (rédaction), validation Aristote en attente | `PASSATION OFFICIELLE` (conceptuel), code réel | `/home/claude/omega/VISION-TO-EXECUTION.md` |
| `NOMENCLATURE-LOCK.md` | réel — décisions verrouillées sur instruction d'Aristote | Aristote (décision), Claude (rédaction) | `IDENTIFIANTS-RENOMMAGE.md` (analyse historique), `CEO-AUDIT-OMEGA.md` | `/home/claude/omega/NOMENCLATURE-LOCK.md` |
| `IDENTIFIANTS-RENOMMAGE.md` | réel — superseded, conservé comme analyse historique | Claude (rédaction) | Voir note de supersession en tête du fichier | `/home/claude/omega/IDENTIFIANTS-RENOMMAGE.md` |
| `ARBORESCENCE-OFFICIELLE.md` | réel — proposition non appliquée | Claude (rédaction), validation Aristote en attente | `MASTER-RUNBOOK-V1` (conceptuel) pour la liste des fichiers nommés à classer | `/home/claude/omega/ARBORESCENCE-OFFICIELLE.md` |
| `CEO-AUDIT-OMEGA.md` | réel — **audit validé par Aristote** | Claude (rédaction) — validé | Les 5 pièces CEO conceptuelles, `P2A1-RESULTATS.md`, `LYDIE-MEMORY-SPEC.md`, `LYDIE-FILE-MAP.md` | `/home/claude/omega/CEO-AUDIT-OMEGA.md` |
| `P2A1-RESULTATS.md` | réel — Snapshot Officiel STABLE | Claude (session) — validé par Aristote (figé 2026-09-27 21:33) | Code réel P2A.1 | `/home/claude/omega/P2A1-RESULTATS.md` |
| `CHANGELOG-P2A1.md` | réel | Claude (session) — validé par Aristote | `P2A1-RESULTATS.md` | `/home/claude/omega/CHANGELOG-P2A1.md` |
| `P2B-PLAN.md` | réel (préparation) | Claude (rédaction), validation Aristote en attente | `P2A1-RESULTATS.md`, `CHANGELOG-P2A1.md` | `/home/claude/omega/P2B-PLAN.md` |
| `BAN-INTEGRATION-PLAN.md` | réel (préparation) | Claude (rédaction), validation Aristote en attente | `addressSuggestions.ts` (réel), `P2B-PLAN.md` | `/home/claude/omega/BAN-INTEGRATION-PLAN.md` |
| `LYDIE-MEMORY-SPEC.md` | réel (préparation) | Claude (rédaction), validation Aristote en attente | `engine.ts` (`addressDraft`), `resume.ts` | `/home/claude/omega/LYDIE-MEMORY-SPEC.md` |
| `LYDIE-FILE-MAP.md` | réel (préparation) | Claude (rédaction), validation Aristote en attente | Tous les fichiers `src/lib/lydie/*` | `/home/claude/omega/LYDIE-FILE-MAP.md` |
| `TECH-DEBT-P2A1.md` | **réel — référence officielle verrouillée** | Claude (session) — validé par Aristote | 156 vérifications réellement exécutées | `/home/claude/omega/TECH-DEBT-P2A1.md` |
| `OMEGA-DOC-LOCK-v1.md` | réel — rapport final de cette mission | Claude (rédaction), validation Aristote en attente | Tous les documents de cette mission | `/home/claude/omega/OMEGA-DOC-LOCK-v1.md` |
| `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md` | **réel — document maître, verrouillé** | Aristote (auteur), Claude (exécution) | Remplace les consignes dispersées ; subordonné à `DECISION-LOG.md` pour les décisions déjà tranchées | `/home/claude/omega/ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md` |
| `DECISION-LOG.md` | réel — journal unique des décisions | Claude (rédaction), Aristote (arbitrages) | Toutes les décisions déjà tranchées (voir tableau interne) | `/home/claude/omega/DECISION-LOG.md` |
| `ARBITRAGES-P2B.2.md` | réel — arbitrages verrouillés | Aristote (décision), Claude (rédaction) | `P2B.1-EXECUTION.md` | `/home/claude/omega/ARBITRAGES-P2B.2.md` |
| `P2B.0-EXECUTION.md` | réel — sprint clos, validé | Claude (exécution) — validé par Aristote | `BAN-INTEGRATION-PLAN.md`, `LYDIE-MEMORY-SPEC.md` | `/home/claude/omega/P2B.0-EXECUTION.md` |
| `P2B.1-EXECUTION.md` | réel — sprint clos, validé | Claude (exécution) — validé par Aristote | `P2B.0-EXECUTION.md` | `/home/claude/omega/P2B.1-EXECUTION.md` |
| `P2B.2-EXECUTION.md` | réel — sprint clos, validé | Claude (exécution) — validé par Aristote | `ARBITRAGES-P2B.2.md` | `/home/claude/omega/P2B.2-EXECUTION.md` |
| `P3.0-RECONNAISSANCE.md` | réel — repérage avant sprint | Claude (rédaction) | `P2B.2-EXECUTION.md` | `/home/claude/omega/P3.0-RECONNAISSANCE.md` |
| `P3.0-EXECUTION.md` | réel — sprint clos | Claude (exécution) | `P3.0-RECONNAISSANCE.md` | `/home/claude/omega/P3.0-EXECUTION.md` |
| `P3.1-EXECUTION.md` | réel — sprint clos | Claude (exécution) | `P3.0-EXECUTION.md` | `/home/claude/omega/P3.1-EXECUTION.md` |
| `P3.2-EXECUTION.md` | réel — sprint clos | Claude (exécution) | Décision Aristote « réseaux, vue dérivée » (`DECISION-LOG.md`) | `/home/claude/omega/P3.2-EXECUTION.md` |
| `src/lib/j20/reseaux.ts` | réel — code, testé | Claude (exécution) | `src/lib/j20/client.ts` (lecture) | `/home/claude/omega/src/lib/j20/reseaux.ts` |
| `P3.3-EXECUTION.md` | réel — sprint clos | Claude (exécution) | `resume.ts`, `dossier.repository.ts` (lecture) | `/home/claude/omega/P3.3-EXECUTION.md` |
| `P3.4-EXECUTION.md` | réel — sprint clos, verdict MVP PRÊT | Claude (exécution) | Audit complet du parcours (P3.0→P3.3) | `/home/claude/omega/P3.4-EXECUTION.md` |
| `src/lib/testmode/scenario.ts` | réel — code, testé (16 tests) | Claude (exécution) | Aucune (module pur, sans dépendance) | `/home/claude/omega/src/lib/testmode/scenario.ts` |
| `src/components/testmode/TestModePanel.tsx` / `TestModeButton.tsx` | réel — code, vérifié par lecture | Claude (exécution) | `scenario.ts`, monté dans `src/app/layout.tsx` | `/home/claude/omega/src/components/testmode/` |
| `P3.4-MVP-VALIDATION.md` | réel — livrable du Mode Test officiel | Claude (exécution), validation Aristote en attente | `scenario.ts`, `TestModePanel.tsx` | `/home/claude/omega/P3.4-MVP-VALIDATION.md` |
| `GOLD-MASTER.md` | **réel — référence officielle OMEGA v1.0, verrouillée** | Claude (rédaction), validation Aristote en attente | Tous les `P?.?-EXECUTION.md`, `DECISION-LOG.md` | `/home/claude/omega/GOLD-MASTER.md` |
| `RELEASE-NOTES-v1.0.md` | réel — consolidation, aucun code modifié | Claude (rédaction) | Tous les `P?.?-EXECUTION.md` | `/home/claude/omega/RELEASE-NOTES-v1.0.md` |
| `KNOWN-LIMITATIONS.md` | réel — limites réellement prouvées uniquement | Claude (rédaction) | `TECH-DEBT-P2A1.md`, `P3.4-EXECUTION.md`, `P3.4-MVP-VALIDATION.md`, `DECISION-LOG.md` | `/home/claude/omega/KNOWN-LIMITATIONS.md` |
| `TEST-PROTOCOL.md` | réel — formalisation du Mode Test officiel | Claude (rédaction) | `src/lib/testmode/scenario.ts` | `/home/claude/omega/TEST-PROTOCOL.md` |
| `NEXT-STEPS.md` | réel — liste uniquement, rien d'implémenté | Claude (rédaction) | `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md`, `DECISION-LOG.md` | `/home/claude/omega/NEXT-STEPS.md` |
| `INSTALL.md` | réel — procédure d'installation, aucun code modifié | Claude (rédaction) | `package.json`, `.env.example` | `/home/claude/omega/INSTALL.md` |
| `RUN-LOCAL.md` | réel — commande de lancement exacte | Claude (rédaction) | `package.json` (script `dev`), `TEST-PROTOCOL.md` | `/home/claude/omega/RUN-LOCAL.md` |
| `DEPLOY-VERCEL.md` | réel — procédure de déploiement Preview, aucun code modifié | Claude (rédaction) | `next.config.ts` (lecture — aucun `vercel.json` nécessaire) | `/home/claude/omega/DEPLOY-VERCEL.md` |
| `AUDIT-PACK.md` | réel — résumé technique pour audits externes, aucun code modifié | Claude (rédaction) | Tous les `P?.?-EXECUTION.md`, `DECISION-LOG.md`, `KNOWN-LIMITATIONS.md` | `/home/claude/omega/AUDIT-PACK.md` |
| `FILE-MAP.md` | réel — carte des fichiers importants | Claude (rédaction) | `AUDIT-PACK.md` | `/home/claude/omega/FILE-MAP.md` |
| `QUICK-START-AUDIT.md` | réel — point d'entrée pour un audit externe | Claude (rédaction) | `AUDIT-PACK.md`, `FILE-MAP.md` | `/home/claude/omega/QUICK-START-AUDIT.md` |
| `HOTFIX-001-route-zod-build.md` | réel — correction d'un blocage de build Vercel, non vérifiée par compilation réelle | Claude (exécution) | `src/app/api/lydie/route.ts` (1 ligne modifiée) | `/home/claude/omega/HOTFIX-001-route-zod-build.md` |

## 2. Brouillons ADR (cette mission)

| Document | Statut | Propriétaire | Dépendances | Emplacement |
|---|---|---|---|---|
| `ADR-001-lydie-entree-unique.md` | brouillon | Aristote (décision), Claude (rédaction) | `engine.ts` (lecture) | `/home/claude/omega/adr-drafts/ADR-001-lydie-entree-unique.md` |
| `ADR-002-un-dossier-unique-par-projet.md` | brouillon | Aristote (décision), Claude (rédaction) | `resume.ts`, `engine.ts` (lecture) | `/home/claude/omega/adr-drafts/ADR-002-un-dossier-unique-par-projet.md` |
| `ADR-003-pole-specialise-prend-le-relais.md` | brouillon — résout la collision `LAP-001` | Aristote (décision), Claude (rédaction) | `NOMENCLATURE-LOCK.md`, `ADR-001` | `/home/claude/omega/adr-drafts/ADR-003-pole-specialise-prend-le-relais.md` |
| `ADR-004-por-001-obligatoire.md` | brouillon | Aristote (décision), Claude (rédaction) | `P2A1-RESULTATS.md`, `CEO-AUDIT-OMEGA.md` (exemples) | `/home/claude/omega/adr-drafts/ADR-004-por-001-obligatoire.md` |
| `ADR-005-un-identifiant-un-document.md` | brouillon — formalise `NOMENCLATURE-LOCK.md` | Aristote (décision), Claude (rédaction) | `NOMENCLATURE-LOCK.md` | `/home/claude/omega/adr-drafts/ADR-005-un-identifiant-un-document.md` |

## 3. Documents conceptuels (reçus, non intégrés au dépôt sous ce nom)

| Document | Statut | Propriétaire | Dépendances | Emplacement |
|---|---|---|---|---|
| `MASTER-RUNBOOK-V1` | conceptuel — mission proposée, cohérente avec le réel | Aristote (émetteur) | `P2A1-RESULTATS.md` (base obligatoire déclarée) | Reçu en conversation — non copié dans le dépôt |
| `PASSATION OFFICIELLE — ARISTOTE ONE OMEGA v1` | conceptuel — vision globale, aucune correspondance codée établie | Aristote (émetteur), ChatGPT (rédacteur déclaré) | Aucune dépendance vers le code réel établie | Reçu en conversation (2 copies identiques) — non copié dans le dépôt |
| `TECH-DEBT-P2A1.md` (version conceptuelle reçue) | conceptuel — **collision résolue par renommage anticipé** (voir `NOMENCLATURE-LOCK.md` §1) | Aristote (émetteur), ChatGPT (rédacteur déclaré) | Renommage verrouillé : `TECH-DEBT-VISION-ARISTOTE-ONE.md` si créé | Reçu en conversation (2 copies quasi identiques) — non copié dans le dépôt |

## 4. Documents à créer (nommés dans les pièces conceptuelles, contenu inexistant)

| Document | Statut | Propriétaire | Dépendances | Emplacement prévu |
|---|---|---|---|---|
| `LZ-000-CONSTITUTION-LYDIE-V1.md` | à créer | À définir | Zone grise avec « Livre V — Lydie », non résolue (`VISION-TO-EXECUTION.md` §4.3) | Non tranché — voir `ARBORESCENCE-OFFICIELLE.md` §2 |
| `LZ-001-REGLE-3-SECONDES.md` | à créer | À définir | `LZ-000` | Non tranché |
| `PB-001-PRODUCT-BOOK-V1.md` | à créer | À définir | — | Non tranché |
| `LV1-000-BIBLE-VISUELLE-V1.md` | à créer | À définir | Couleur d'accent non tranchée (`NOMENCLATURE-LOCK.md` §6) | Non tranché |
| `ADN-001.md` (10 lois de Lydie) | à créer | À définir | `LZ-000` | Non tranché |
| `PMO-001.md` | à créer | À définir | — | Non tranché |
| `POR-001.md` (gabarit) | à créer | À définir | Principe déjà appliqué en pratique — formalisé par `ADR-004` | `docs/reports/` (proposé) |
| `RISK-REGISTER.md` | à créer | À définir | Risques déjà listés dans `TECH-DEBT-P2A1.md` (réel) — à référencer, pas dupliquer | `docs/tech-debt/` (proposé) |
| `ADR-0001.md` … `ADR-0006.md` (nommés par `MASTER-RUNBOOK-V1`, distincts des `ADR-00X` de cette mission) | à créer | À définir | Gabarit ADR maintenant disponible (voir brouillons `adr-drafts/`) | `docs/adr/` (proposé) |
| 12 Livres (I. Constitution → XII. Master Backlog) | à créer | À définir | Zone grise §4.1/§4.2 de `VISION-TO-EXECUTION.md` | Non tranché |
| RFC (numérotation non définie) | à créer | À définir | Numérotation et dépendances entièrement à définir | `docs/rfc/` (proposé) |
| `docs/academy/*`, `docs/passation/*` | à créer — dossiers réservés, aucun contenu source identifié | À définir | Voir `ARBORESCENCE-OFFICIELLE.md` §4 | `docs/academy/`, `docs/passation/` (proposés, vides) |

## 5. Ce que cet index ne fait pas

- Il ne crée aucun des documents listés en §4 — seule leur existence future est indexée.
- Il ne tranche aucune zone grise — il les référence vers `VISION-TO-EXECUTION.md` et `NOMENCLATURE-LOCK.md`.
- Il ne modifie aucun fichier `.ts`, aucun schéma Prisma, aucune transition J20.
- Il n'applique pas `ARBORESCENCE-OFFICIELLE.md` — les emplacements « proposés » n'existent pas encore physiquement.
