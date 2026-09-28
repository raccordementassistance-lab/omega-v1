# RELEASE-NOTES-v1.0.md — OMEGA v1.0 (Gold Master)

Notes de version consolidées à partir des rapports de sprint réels (`P?.?-EXECUTION.md`). Aucun élément listé ici n'est nouveau : ce document réorganise ce qui a déjà été livré et prouvé, dans l'ordre chronologique.

## v1.0 — Gold Master (2026-09-28)

Gel officiel du MVP avant audits croisés. Aucun code métier nouveau dans cette version — uniquement la consolidation documentaire (`GOLD-MASTER.md`, `KNOWN-LIMITATIONS.md`, `TEST-PROTOCOL.md`, `NEXT-STEPS.md`, ce document).

### Fonctionnalités livrées

- **Lydie** — conseillère conversationnelle déterministe : détection de projet, validation stricte de l'adresse (BAN), reconnaissance d'une adresse composite en un seul message, reformulation naturelle et non répétitive, mention de Pluri Raccordé® dès que le projet est identifié, contexte géographique reconnu sans jamais être traité comme une adresse valide.
- **Dossier Unique** — création à la confirmation du mandat ; reprise automatique (« Dossier Vivant ») pour un client authentifié revenant sur `/chat`, sans jamais bloquer la description d'un nouveau projet derrière un dossier déjà finalisé.
- **Pluri Raccordé®** — branding et positionnement en Pôle 1 officiel, présents dans le chat et sur la page dossier.
- **Mission Control** — affichage du projet, des documents, de la progression, et des 4 réseaux (électricité/eau/fibre/gaz) en vue dérivée, sans nouvelle table Prisma.
- **Mode Test officiel** — protocole de validation intégré au projet, reproductible à l'identique à chaque version, avec chronomètre et objectif officiel (accueil → Mission Control en moins de 3 minutes).

### Corrections apportées avant le gel

- **Bug — reprise de dossier bloquant un nouveau projet** : un client avec un dossier déjà finalisé (`DONE`) qui revenait décrire un second projet tombait sur « déjà créé et confirmé ». Corrigé (P3.4) — la reprise automatique ne s'applique plus à un dossier déjà terminé.
- **Bug — « modifier mon adresse email » corrigeait l'adresse postale** : à l'étape de récapitulatif, la vérification du mot « adresse » passait avant celle du mot « email », donc une formulation naturelle contenant les deux (« adresse email ») était mal aiguillée. Corrigé (P3.4) — l'e-mail est vérifié en premier.
- **Bug — `\b` (limite de mot) ne détectait pas un contexte géographique après une préposition accentuée** (ex. « à Bordeaux ») : JavaScript ne reconnaît pas `\b` devant un caractère accentué non-`\w`. Corrigé (P2B.2).

### Historique complet (sprints antérieurs)

- **P2A.1** — Fondations : moteur Lydie, validation d'adresse stricte, snapshot stable figé.
- **P2B.0** — Intégration des suggestions d'adresse BAN (module pur, isolé du reste du moteur).
- **P2B.1** — Reconnaissance d'une adresse fournie dans le même message que le projet.
- **P2B.2** — Reformulation naturelle, réutilisation intelligente des informations validées, mention de Pluri Raccordé® au bon moment.
- **P3.0** — Premier parcours client complet audité de bout en bout.
- **P3.1** — Expérience Premium : messages plus naturels aux étapes documents/e-mail.
- **P3.2** — Mission Control : vue dérivée des réseaux, décision explicite de ne pas persister en base pour ce sprint.
- **P3.3** — Dossier Vivant : reprise de session pour un client authentifié.

### Ce qui n'a volontairement pas changé

- `hasCompleteAddress()` / `ADDRESS_PATTERN` — inchangés depuis P2A.1.
- La State Machine J20 (15 états) — inchangée.
- Le schéma Prisma — inchangé (aucune migration sur toute la phase MVP).
- Aucune intégration Stripe, aucun déploiement — explicitement hors périmètre du MVP.

### Preuves de cette version

- `tsc -p tsconfig.json` → 0 erreur.
- 184 vérifications automatisées réellement exécutées, 0 échec (dernière exécution complète, sprint P3.4bis).
- Détail complet, fichier par fichier, dans chaque `P?.?-EXECUTION.md` correspondant.
