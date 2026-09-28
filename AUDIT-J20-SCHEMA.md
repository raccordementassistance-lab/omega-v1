# Audit J20 — schéma et architecture métier

Date : 19/09/2026

## 1. Schéma réel audité

Le schéma source conserve les modèles applicatifs existants : `User`, `Dossier`, `Demande`, `Message`, `TimelineEvent`, `DossierStatusHistory`, `Document`, `InternalNote`, `EmailLog`, ainsi que les nouveaux objets J20 `AuditLog`, `InboxEvent`, `Devis`, `LigneDevis` et `DevisAuditLog`.

Le référentiel J20 canonique contient exactement 15 états et 5 acteurs.

## 2. Diff J20

Ajouts / changements :
- `Dossier.state` + `Dossier.version`.
- passage de l'ancien référentiel de statuts au référentiel J20 15 états.
- `ActorType` : SYSTEME, CLIENT, CONSEILLER, ADMIN, WEBHOOK_ENEDIS.
- `AuditLog` et `InboxEvent`.
- Devis, lignes de devis et audit des devis.
- types de documents `PIECE_IDENTITE`, `JUSTIFICATIF_DOMICILE`, `MANDAT_SIGNE` et statut `VALIDE`.
- `Document.expiresAt` pour les preuves/documentations à durée de validité.

Aucun remplacement global de `schema.prisma` n'est effectué.

## 3. Guards métier

> **Mise à jour du 27/09/2026** — les deux points ci-dessous ont été corrigés
> pour refléter la règle métier actuelle (validée et implémentée) ; le reste
> de ce document n'a pas été revérifié à cette date.

- `DOSSIER_PRET` ne bloque plus sur aucun document (pièce d'identité,
  justificatif de domicile, plan de masse, etc.) : ces documents servent
  uniquement à **anticiper** le traitement du dossier, jamais à le
  bloquer (voir `src/lib/lydie/documentRecommendations.ts`). Le guard
  protège uniquement les **données fondamentales** du dossier : un
  demandeur identifiable (`Dossier.clientId`), une Demande explicitement
  identifiée par son `demandeId` (jamais choisie implicitement comme « la
  plus récente »), une typologie de projet définie, un moyen de contact
  valide et une adresse de projet déterminée. Identité du demandeur ≠
  fichier `PIECE_IDENTITE` ; adresse du projet ≠ `JUSTIFICATIF_DOMICILE`.
- Le mandat n'est plus un document indépendant que le client doit
  fournir. La source de vérité est constituée des **3 consentements**
  portés par `Demande` (`mandatRepresentation`, `mandatTransmission`,
  `mandatConfirmation`). Le document `Document(type=MANDAT_SIGNE,
  status=VALIDE)` est **matérialisé automatiquement** dès que ces 3
  consentements sont enregistrés (voir `finalizeLydieQualification()`
  dans `src/app/api/lydie/route.ts`) — jamais téléversé par le client. Le
  guard `MANDAT_A_SIGNER → MANDAT_SIGNE` vérifie les **deux niveaux** : les
  3 consentements de la Demande explicitement désignée par son
  `demandeId`, **et** l'existence de ce document rattaché à cette même
  Demande (jamais un document seul, jamais une autre Demande). Aucun
  modèle `Mandat` séparé n'existe ni n'est nécessaire.

## 4. Concurrence / audit / idempotence

- `Dossier.version` est utilisé pour le verrouillage optimiste.
- transition + historique + timeline + audit sont écrits dans la même transaction.
- `InboxEvent.externalId` est unique.
- le webhook Enedis passe maintenant par le même moteur transactionnel que les autres transitions.
- HMAC SHA-256 sur le corps brut du webhook.

## 5. Correction importante appliquée

La migration J20 15 états ajoutait initialement `Dossier.state` avec la valeur par défaut `NOUVEAU`, ce qui aurait pu écraser la représentation d'état des dossiers existants.

La migration a été corrigée pour recalculer `state` à partir de l'ancien `status` avant le remplacement des enums. Les anciens statuts sont ensuite convertis vers leurs états J20 correspondants.

## 6. Validation d'exécution

La validation locale complète reste à exécuter dans un environnement disposant des dépendances npm et des variables Supabase/PostgreSQL. `npm install` a dépassé le délai dans l'environnement de préparation ; aucun `typecheck`, `lint`, `test` ou `build` n'est donc déclaré comme réussi.
