# NEXT-STEPS.md — Travaux futurs après OMEGA v1.0

Liste uniquement — **rien n'est implémenté par ce document**, conformément à la règle du Gold Master (aucun nouveau code métier sur cette branche). Reprend et consolide la feuille de route déjà posée dans `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md` et les arbitrages ouverts de `DECISION-LOG.md`, sans rien y ajouter.

## P4 — Préparation production

- Architecture de paiement (sans intégration Stripe réelle à ce stade).
- Structure CRM.
- Emails transactionnels réels (`src/lib/email/` existe déjà partiellement dans le dépôt — non audité pendant la phase MVP, à reprendre en premier).
- Déploiement — sans casser la State Machine J20.

## P5 — Scale (1 → 1000 clients)

- Cache.
- Performances.
- Observabilité.
- Monitoring.
- Files d'attente.

## P6 — Enterprise

- Multi-projets par client.
- Constructeurs, promoteurs, entreprises.
- Nécessitera de revisiter la décision P3.3 « dossier le plus récent = `createdAt desc` », aujourd'hui simplifiée pour un seul dossier actif par client (voir `KNOWN-LIMITATIONS.md` §2, point 8).

## Arbitrages en attente (non bloquants pour OMEGA v1.0, à trancher avant d'aller plus loin)

Repris tels quels depuis `DECISION-LOG.md` — aucun de ces points n'a été tranché, aucun ne doit être présumé résolu par ce Gold Master :

- Renommage visible « Espace client » → « Mission Control » (nom de marque, touche plusieurs routes).
- Persistance réelle des réseaux multiples (eau, fibre, gaz) si Pluri Raccordé® doit un jour les qualifier réellement, au-delà de la vue dérivée actuelle.
- Sort du widget « Parler à Lydie » une fois un dossier confirmé (bug UX potentiel ou choix voulu — non tranché).
- Perte de données avant authentification (nécessiterait Prisma).

## Vérifications techniques à lever en priorité, avant tout déploiement réel

Reprises depuis `TECH-DEBT-P2A1.md` (limites d'environnement, inchangées depuis P2A.1, détaillées dans `KNOWN-LIMITATIONS.md` §1) :

- Premier `npm install` réussi dans un environnement avec accès complet au registre npm, puis `npm run build` / `npm run lint` / `npx prisma generate` réels.
- Exécution réelle de `fetchAddressSuggestions()` contre la vraie API BAN, depuis un environnement avec accès réseau sortant.
- Première exécution réelle du Mode Test (`TEST-PROTOCOL.md`) par un testeur humain, dans un navigateur réel, avec captures d'écran et chronométrage réel.
- Validation en environnement staging / Supabase réel.

## Rappel de méthode pour toute reprise de travail après ce gel

- `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md` reste la référence de gouvernance : POR-001, spec-first, aucune preuve simulée, aucune claim sans preuve.
- Aucun de ces travaux futurs n'est priorisé ni planifié par ce document — il ne fait que lister ce qui a déjà été identifié, pour que rien ne soit perdu au moment de rouvrir le développement.
