# KNOWN-LIMITATIONS.md — OMEGA v1.0

Uniquement les limites **réellement prouvées** par l'exécution ou par lecture explicitement labellisée comme telle dans les rapports de sprint. Aucune limite spéculative n'est listée ici — pour l'historique complet des risques envisagés (dont certains n'ont jamais été retenus comme limites actuelles), voir `TECH-DEBT-P2A1.md`.

## 1. Limites d'environnement (structurelles, présentes depuis P2A.1, inchangées)

| # | Limite | Preuve | Impact |
|---|---|---|---|
| 1 | Aucune exécution réelle de Next.js/React/Prisma dans cet environnement de développement | `npm install` / `npm ci` → 403 sur `registry.npmjs.org`, confirmé par exécution réelle à chaque tentative depuis P2A.1 | Tous les fichiers `route.ts`, `*.tsx`, et tout code dépendant de Prisma sont vérifiés **par lecture uniquement** (👁️), jamais compilés ni exécutés dans ce dépôt |
| 2 | Aucun appel réseau sortant réel possible (ex. BAN, tout service externe) | `curl`/`WebFetch` bloqués (403 / ROBOTS_DISALLOWED), confirmé par exécution réelle | La logique de parsing des suggestions d'adresse est testée avec un transport simulé, jamais avec une vraie réponse BAN observée dans ce dépôt |
| 3 | Aucun `npm run build`, `npm run lint`, `npx prisma generate` exécutable | Mêmes causes que #1 | Toute la preuve technique de ce projet repose sur `tsc` (compilateur seul, installé séparément) et un shim `vitest` maison — jamais les outils officiels du projet |
| 4 | Aucun accès à un environnement staging ou à Supabase | Aucun accès réseau sortant (#2) | La validation en conditions réelles (staging, base de données réelle) n'a jamais été faite depuis ce dépôt |
| 5 | Aucune capture d'écran réelle, aucune mesure chronométrée réelle du parcours | Conséquence directe de #1 (aucun navigateur réel exécutable) | Le Mode Test (`TEST-PROTOCOL.md`) guide et chronomètre un parcours, mais sa première exécution réelle doit être faite par un humain, hors de cet environnement |

## 2. Limites fonctionnelles connues (comportement actuel, décisions déjà prises)

| # | Limite | Où c'est décidé | Pourquoi ce n'est pas un bug |
|---|---|---|---|
| 6 | Seul l'état `PROJECT` (pas de Demande) ou `DONE` (Demande finalisée) peut être reconstruit automatiquement depuis Prisma pour un client qui revient | `deriveLydieContextFromDossier()`, confirmé par lecture (P3.3/P3.4) | Aucun état intermédiaire (adresse donnée, documents en cours) n'est persisté en base tant que le mandat n'est pas signé — persistance côté navigateur uniquement (`localStorage`, inchangée) |
| 7 | Eau, Fibre et Gaz affichent toujours « À déterminer » sur Mission Control | Décision explicite d'Aristote (P3.2, `DECISION-LOG.md`) : vue dérivée, aucune donnée inventée | Aucune source de données ne permet aujourd'hui de qualifier ces réseaux ; les afficher autrement serait inventer une information |
| 8 | « Dossier le plus récent » d'un client = le plus récemment **créé**, pas le plus récemment actif | Décision explicite (P3.3, `DECISION-LOG.md`) | Choix simple assumé pour un seul dossier actif par client ; à revoir si le multi-dossier devient réel (P6) |
| 9 | La reprise automatique de dossier ne concerne que `/chat` (entrée générale) ; la page dossier (`espace-client/dossiers/[id]`) cible explicitement un dossier précis et affiche toujours son état réel, y compris « déjà confirmé » | Corrigé et documenté en P3.4 (Bug 1) | Comportement voulu : les deux points d'entrée ont des rôles différents |

## 3. Arbitrages ouverts (non tranchés — ne sont pas des limites en soi, mais des décisions produit en attente)

Ces points sont signalés dans `DECISION-LOG.md` (section « Arbitrages ouverts ») et n'ont pas d'impact sur la démo actuelle :

- Perte de données avant authentification (nécessiterait Prisma — hors périmètre du MVP actuel).
- Comportement du widget « Parler à Lydie » une fois le dossier confirmé (bug UX potentiel ou choix voulu — non tranché).
- Renommage visible « Espace client » → « Mission Control » (nom de marque, touche plusieurs routes — non tranché).
- Persistance réelle de plusieurs réseaux si Pluri Raccordé® doit un jour les qualifier réellement (au-delà de la vue dérivée actuelle).

## 4. Ce qui N'EST PAS une limitation actuelle

Pour éviter toute confusion lors des audits croisés : `hasCompleteAddress()`, la State Machine J20, et le schéma Prisma sont **inchangés et non remis en cause** — ce ne sont pas des limitations, c'est une contrainte de gouvernance volontaire (voir `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md`, Lois Immuables).
