# Pack CTO final — Omega / Raccordement Assistance

Date de preuve : 2026-09-21T08:51:58Z  
Commit contrôlé : `3686add1b89a48011f35739d0132a84f4219e07f`  
Périmètre : projet racine `/workspaces/-J20-LydieIA`

## 1. Décision

**GO technique pour le code livré. NO-GO opérationnel pour l'ouverture
production tant que les contrôles d'environnement ci-dessous ne sont pas
signés dans la cible réelle.**

Le périmètre racine est le seul périmètre de production contrôlé. Les copies
présentes dans `OMEGA-CONTENU-COMPLET/`, `consolidation/`, `j20-p42/`,
`raccordement-assistance/` et `raccordement-assistance-FINAL/` sont des
artefacts de consolidation et ne constituent pas une seconde application à
valider.

## 2. Registre de preuves exécutées

Les résultats ci-dessous proviennent d'une exécution locale réelle sur le
commit indiqué ci-dessus. Un statut `PASS` signifie que la commande s'est
terminée avec le code 0.

| ID | Commande exacte | Résultat observé | Statut |
|---|---|---|---|
| CTO-001 | `npm run typecheck` | `tsc --noEmit` terminé sans erreur | PASS |
| CTO-002 | `npm run lint` | `eslint .` terminé sans erreur | PASS |
| CTO-003 | `npm test` | 5 fichiers, 18 tests, 0 échec | PASS |
| CTO-004 | `DATABASE_URL=... DIRECT_URL=... npx prisma validate` | schéma `prisma/schema.prisma` valide | PASS |
| CTO-005 | `npm run prisma:generate` | Prisma Client v5.22.0 généré | PASS |
| CTO-006 | `npm run build` | build Next.js production réussi, 21 pages générées | PASS |

Les URL utilisées pour `CTO-004` étaient des valeurs locales factices non
secrètes (`postgresql://user:pass@localhost:5432/db`). Cette preuve valide la
structure du schéma, pas l'accessibilité d'une base de production.

## 3. Couverture technique démontrée

- TypeScript, ESLint et compilation Next.js passent sur le projet racine.
- Les tests unitaires passent, notamment le moteur Lydie et la machine d'état.
- Le client Prisma est généré depuis le schéma racine.
- Les routes critiques sont présentes dans le build : dossiers, documents,
  Lydie, espace client et webhook Enedis.
- Les migrations J20 sont présentes, dont `20260919230000_j20_state_machine`
  et `20260919235900_j20_15_states_devis`.
- Le schéma et l'architecture J20 sont détaillés dans
  [AUDIT-J20-SCHEMA.md](j20-p42/j20-p43b-retry/j20-p43a-final/AUDIT-J20-SCHEMA.md).

## 4. Portes de production non certifiées localement

Ces points restent des conditions de mise en production et ne doivent pas être
cochés sur la seule base des preuves locales :

- variables réelles `DATABASE_URL`, `DIRECT_URL`, Supabase, email et
  `ENEDIS_WEBHOOK_SECRET` présentes et non exposées ;
- connexion à la base PostgreSQL de la cible et exécution de
  `npx prisma migrate deploy` ;
- politiques Supabase/Auth/Storage et droits conseiller vérifiés ;
- test de signature HMAC Enedis, idempotence et rejeu dans un environnement de
  recette ;
- smoke tests post-déploiement sur l'URL publique ;
- sauvegarde et procédure de rollback confirmées.

La checklist d'environnement opérationnelle est disponible dans
[02-checklist-environnement.md](pack-pre-lancement-production/02-checklist-environnement.md).

## 5. Procédure de revalidation

Depuis la racine, avec les variables de l'environnement cible chargées :

```bash
npm ci
npm run prisma:generate
npx prisma validate
npx prisma migrate deploy
npm run typecheck
npm run lint
npm test
npm run build
```

La mise en production n'est autorisée qu'après succès de cette séquence et
validation séparée des portes d'environnement de la section 4.

## 6. Sign-off

| Décision | Responsable | Date | Preuve |
|---|---|---|---|
| Code / CI locale | CTO / tech lead | 2026-09-21 | Registre CTO-001 à CTO-006 |
| Environnement cible | À renseigner | À renseigner | Checklist production |
| Go-live | À renseigner | À renseigner | Smoke tests + rollback |