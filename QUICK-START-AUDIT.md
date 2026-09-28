# QUICK-START-AUDIT.md — Ouvrir le ZIP en moins de 5 minutes

Pour un auditeur externe (humain ou IA) qui reçoit `omega-v1.0-gold-master.zip` sans autre contexte.

## 1. Extraire (30 s)

```bash
unzip omega-v1.0-gold-master.zip
cd omega
```

## 2. Lire, dans cet ordre exact (≈ 3 min)

1. **`GOLD-MASTER.md`** — ce qu'est le projet, ce qui a été livré, le verdict officiel.
2. **`AUDIT-PACK.md`** — le résumé technique : invariants à vérifier, état réel des preuves, bugs déjà trouvés/corrigés, limites.
3. **`FILE-MAP.md`** — quels fichiers regarder pour vérifier chaque point du résumé technique.
4. **`KNOWN-LIMITATIONS.md`** — pour ne pas re-découvrir, en le présentant comme neuf, un point déjà signalé.

Si le temps manque, **`AUDIT-PACK.md` seul** contient l'essentiel (invariants + preuves + limites + bugs corrigés).

## 3. Vérifier soi-même, si un environnement npm complet est disponible (≈ 1 min de lancement, puis autant que l'audit le demande)

```bash
npm install
npx tsc --noEmit
npx vitest run
```

Résultat attendu : 0 erreur de compilation ; au minimum les 184 vérifications listées dans `AUDIT-PACK.md` §3 passent (10 fichiers de tests sur 13 — les 3 fichiers restants n'ont jamais été réexécutés par Claude dans cette mission, voir la raison exacte dans `AUDIT-PACK.md`, à vérifier en priorité par cet audit puisque c'est justement ce qui manque).

## 4. Ne pas re-découvrir ce qui est déjà tranché

Avant de signaler un point comme un problème, vérifier qu'il n'est pas déjà dans :
- `DECISION-LOG.md` (arbitrages déjà tranchés — fait foi en cas de doute) ;
- `KNOWN-LIMITATIONS.md` (limites déjà prouvées et documentées).

## 5. Pour aller plus loin

- Lancer réellement le projet : `INSTALL.md` puis `RUN-LOCAL.md`.
- Le déployer pour un test manuel : `DEPLOY-VERCEL.md`.
- Rejouer le parcours officiel de démonstration : `TEST-PROTOCOL.md`.
- Voir l'historique complet, sprint par sprint : `RELEASE-NOTES-v1.0.md`.

## Ce que ce document ne fait pas

Il ne dispense pas de lire `AUDIT-PACK.md` en détail avant de conclure quoi que ce soit — c'est un point d'entrée, pas un résumé du résumé.
