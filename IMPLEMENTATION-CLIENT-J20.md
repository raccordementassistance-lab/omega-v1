# Implémentation Espace Client — J20

Cette version intègre le parcours client dans Next.js.

## Réalisé
- `/espace-client` : liste réelle des dossiers du client connecté.
- `/espace-client/dossiers/[id]` : suivi détaillé.
- Référentiel visuel des 15 états J20.
- Barre de progression et message associé à chaque état.
- Projet et adresse affichés depuis les données réelles.
- Documents réels + upload via l'API existante.
- Timeline réelle via `/api/dossiers/:id/timeline`.
- Messagerie Lydie persistée dans `messages` quand un `dossierId` est fourni.
- Accès contrôlé par le propriétaire du dossier / staff via les contrôles existants.
- Interface responsive pensée pour 390 px et desktop.
- Maquettes statiques conservées dans `public/espace-client/captures/`.
- `public/espace-client/assets/js/statuts.js` aligné sur les 15 états J20.

## Limitation de validation
Les dépendances npm n'ont pas pu être installées dans l'environnement de préparation (deux tentatives ont dépassé le délai disponible). Aucun résultat `typecheck`, `lint`, `test` ou `build` n'est donc présenté comme réussi.

La validation finale doit être exécutée dans Replit avec les variables d'environnement et la base Supabase configurées.
