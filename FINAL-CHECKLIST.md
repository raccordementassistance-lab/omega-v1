# Checklist finale
- [x] Raccordement électrique uniquement
- [x] Pas de promesse de traitement sous 24 h
- [x] Lydie branchée sur `/api/lydie`
- [x] Lydie directe et progressive
- [x] Pages publiques intégrées
- [x] Espace client intégré
- [x] Espace conseiller intégré
- [x] `.env.example` fourni
- [x] `next-env.d.ts` fourni
- [ ] Variables Supabase/Postgres à renseigner dans Replit
- [ ] Lancer `npm install && npm run typecheck && npm run lint && npm run build`

## Consolidation J20 — 19/09/2026
- [x] Moteur d'état centralisé (`src/state-machine/state-machine-engine.ts`)
- [x] Verrouillage optimiste par `Dossier.version`
- [x] `TERMINE` mène uniquement à `ARCHIVE_INACTIF`; `ARCHIVE_INACTIF` est terminal
- [x] Journal `AuditLog`
- [x] Idempotence des événements via `InboxEvent`
- [x] Webhook Enedis HMAC-SHA256 (`/api/webhooks/enedis`)
- [x] Gestion des contradictions Enedis vers `BLOQUE` lorsqu'une transition est incohérente
- [x] Migration Prisma J20
- [x] Tests unitaires du moteur d'état
- [ ] Exécuter les validations dans Replit avec les vraies dépendances et variables d'environnement

## Consolidation J20 finale

- [x] `Dossier.state` synchronisé avec `Dossier.status` par le moteur J20.
- [x] Verrouillage optimiste via `Dossier.version`.
- [x] `TERMINE` autorise uniquement l’archivage ; `ARCHIVE_INACTIF` est terminal.
- [x] `AuditLog` pour les transitions et événements Enedis.
- [x] `InboxEvent` avec idempotence par `externalId`.
- [x] Webhook Enedis authentifié par HMAC SHA-256.
- [x] Contradiction Enedis critique → `BLOQUE` ; non critique → `QUALIFICATION`.
- [x] Historique + timeline écrits avec les transitions J20.
- [x] Tests unitaires du moteur d'état présents.

> Le schéma Prisma conserve les modèles existants de l'application (User, Demande,
> Message, Documents, etc.) et intègre J20 par fusion. Le schéma J20 isolé fourni
> séparément ne doit pas remplacer ce fichier, car il supprimerait des modèles utilisés
> par l'application.

## Validation environnement

Les commandes suivantes doivent être exécutées dans Replit avec les dépendances et
les variables d'environnement configurées :

```bash
npm install
npx prisma generate
npx prisma validate
npm run typecheck
npm run lint
npm test
npm run build
```

## J20 référentiel final

- [x] 15 états canoniques.
- [x] 5 acteurs : `SYSTEME`, `CLIENT`, `CONSEILLER`, `ADMIN`, `WEBHOOK_ENEDIS`.
- [x] Guard `DOSSIER_PRET` (corrigé le 27/09/2026) : ne bloque sur aucun document (pièce
      d’identité, justificatif de domicile, plan de masse, etc. — ceux-ci ne servent qu’à
      anticiper le traitement, jamais à le bloquer) ; protège uniquement les données
      fondamentales du dossier — demandeur identifiable, Demande explicitement identifiée
      par son `demandeId` (jamais choisie par recency), typologie de projet, moyen de
      contact valide, adresse de projet déterminée.
- [x] Guard `MANDAT_SIGNE` (corrigé le 27/09/2026) : la source de vérité est constituée des
      3 consentements portés par la Demande (`mandatRepresentation`, `mandatTransmission`,
      `mandatConfirmation`), explicitement identifiée par son `demandeId` ; le document
      `MANDAT_SIGNE`/`VALIDE` est matérialisé automatiquement à partir de ces consentements
      et n’est jamais un document indépendant que le client doit fournir — le guard vérifie
      les deux niveaux (consentements + document matérialisé pour cette même Demande).
- [x] Devis, lignes de devis et audit des devis intégrés sans supprimer les modèles existants.
- [x] Migration explicite des anciens statuts vers le référentiel J20.
- [x] Webhook Enedis utilise le verrouillage optimiste et n’écrit plus un état sans validation de transition.
- [ ] Validation technique complète à exécuter dans Replit : l’installation npm de cet environnement a expiré, donc aucun passage local `typecheck/lint/test/build` n’est déclaré comme réussi.

## Audit formel ajouté
- [x] Audit du schéma réel et du diff J20 documenté dans `AUDIT-J20-SCHEMA.md`.
- [x] Correction du backfill `Dossier.state` dans la migration 15 états.
- [x] Webhook Enedis branché sur le même moteur transactionnel de transition.
- [x] `Document.expiresAt` ajouté avec index et migration.
