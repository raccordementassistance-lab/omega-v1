# RUN-LOCAL.md — Lancer OMEGA v1.0 en local

Suppose `INSTALL.md` déjà suivi (dépendances installées, `.env` renseigné).

## Commande exacte

```bash
npm run dev
```

C'est le script `dev` déclaré dans `package.json` (`"dev": "next dev"`) — aucune commande custom, aucun script ajouté pour ce Gold Master.

## Ce que tu dois voir

```
▲ Next.js 15.x
- Local:        http://localhost:3000
```

Ouvrir **http://localhost:3000** dans un navigateur.

## Parcours à tester une fois lancé

Suivre le protocole officiel décrit dans `TEST-PROTOCOL.md` (le Mode Test officiel, accessible via le bouton discret « Mode Test » en bas à droite de n'importe quelle page) :

1. Accueil — Lydie visible, Pluri Raccordé® compris, CTA évident.
2. Projet — tester avec : « Bonjour, je construis une maison à Bordeaux. »
3. Adresse — suggestions BAN, sélection.
4. Dossier Vivant — quitter/revenir, reprise sans répétition.
5. Mission Control — `/espace-client/dossiers/[id]` — projet, documents, progression, réseaux.

## Autres commandes utiles (déclarées dans `package.json`, non ajoutées pour ce document)

```bash
npm run build        # build de production
npm run start         # démarre le build de production (après npm run build)
npm run typecheck     # tsc --noEmit
npm run lint           # eslint
npm test               # vitest run
npm run prisma:studio  # interface Prisma Studio (exploration de la base)
```

## En cas de problème

- **Le serveur ne démarre pas / erreur Prisma** : vérifier que `DATABASE_URL` dans `.env` pointe vers une base PostgreSQL réellement accessible, et que `npx prisma generate` a bien été exécuté (voir `INSTALL.md` étape 4).
- **Les suggestions d'adresse (BAN) n'apparaissent pas** : nécessite un accès réseau sortant vers l'API adresse.data.gouv.fr depuis la machine qui exécute `npm run dev` — sans connexion internet, la fonction retourne une liste vide (comportement documenté, pas un bug — voir `KNOWN-LIMITATIONS.md`).
- **Le bouton « Mode Test » n'apparaît pas** : vérifier que la page a bien fini de charger (composant client, monté dans `src/app/layout.tsx`).
