# TEST-PROTOCOL.md — Mode Test officiel (OMEGA v1.0)

Formalisation, en document autonome, du protocole implémenté dans `src/lib/testmode/scenario.ts` et exposé via le bouton « Mode Test » (`TestModeButton.tsx` / `TestModePanel.tsx`, monté dans `src/app/layout.tsx`, disponible sur toutes les pages). Ce document ne remplace pas le code — c'est sa référence lisible, pour qu'un audit croisé puisse rejouer exactement le même parcours sans lire le code source.

## Objectif

Vérifier, à l'identique à chaque nouvelle version, qu'un utilisateur peut découvrir Lydie et Pluri Raccordé® **en moins de 3 minutes, sans blocage** — et détecter immédiatement toute dégradation de l'expérience, même si les tests techniques automatisés restent tous verts.

## Comment lancer le Mode Test

1. Ouvrir l'application (n'importe quelle page).
2. Cliquer sur le bouton discret « Mode Test » (icône fiole, en bas à droite).
3. Le chronomètre démarre automatiquement à l'ouverture du panneau.
4. Dérouler les 6 étapes ci-dessous, dans l'ordre, en exécutant réellement chaque action dans l'application (le panneau ne fait qu'observer et chronométrer — il n'envoie ni ne simule aucune donnée).
5. À la fin, télécharger le rapport (`.md`) généré automatiquement.

## Le parcours officiel — 6 étapes

### Étape 1 — Accueil (budget 30 s)
Vérifications :
- Lydie est visible immédiatement.
- Pluri Raccordé® est compris immédiatement.
- Le CTA est évident.

Résultat attendu : aucune confusion sur le service.

### Étape 2 — Projet (budget 2 min)
Message de test exact à saisir : **« Bonjour, je construis une maison à Bordeaux. »**

Vérifications :
- Le projet est détecté.
- « Bordeaux » est reconnu comme contexte géographique.
- « Bordeaux » n'est jamais enregistré comme adresse valide.
- La reformulation de Lydie est naturelle.

Résultat attendu : le projet est confirmé sans que Bordeaux soit traité comme une adresse.

### Étape 3 — Adresse (budget 1 min)
Saisir une vraie adresse.

Vérifications :
- Les suggestions BAN s'affichent à la saisie.
- Une suggestion peut être sélectionnée.
- La validation de l'adresse est inchangée (`hasCompleteAddress()`).

Résultat attendu : l'adresse réelle saisie est acceptée sans modification des règles de validation.

### Étape 4 — Dossier Vivant (budget 2 min)
Quitter puis revenir sur le parcours.

Vérifications :
- Le projet est retrouvé.
- Aucune information déjà donnée n'est redemandée.
- La reprise est formulée naturellement.

Résultat attendu : le testeur retrouve son dossier sans avoir à tout ressaisir.

### Étape 5 — Mission Control (budget 2 min)
Vérifications :
- Le projet est affiché.
- Les documents sont affichés.
- La progression est affichée.
- L'historique est affiché.
- Les réseaux sont affichés (vue dérivée — voir `src/lib/j20/reseaux.ts`).

Résultat attendu : Mission Control présente une vue complète et cohérente du dossier.

### Étape 6 — Fin (budget 2 min)
Vérification :
- Le testeur termine le parcours complet sans blocage.

Résultat attendu : aucun point d'arrêt du début à la fin du parcours.

## Chronomètre officiel

- **Objectif verrouillé : accueil → affichage de Mission Control en moins de 3 minutes (180 secondes).**
- Le panneau capture ce temps automatiquement au moment où le testeur avance de l'étape « Dossier Vivant » vers l'étape « Mission Control ».
- Si ce temps dépasse 3 minutes sur une nouvelle version, c'est un signal de dégradation de l'expérience à traiter — indépendamment du résultat des tests techniques automatisés.

## Rapport produit

À la fin du parcours, le panneau affiche le tableau de validation (une ligne par étape, cochée ou non) puis permet de télécharger un rapport Markdown (`P3.4-MVP-VALIDATION-<date>.md`) contenant : le tableau de validation, le chronométrage (temps total + temps accueil → Mission Control face à l'objectif), les bugs détectés (saisis librement par le testeur), des notes, et un verdict automatique (« MVP prêt » si toutes les vérifications sont cochées, « MVP non prêt » sinon).

## Vérification technique complémentaire (non remplacée par le Mode Test)

Le Mode Test valide l'expérience ; il ne remplace pas les preuves techniques suivantes, à exécuter à chaque version :

```
tsc -p tsconfig.json
```
→ doit retourner 0 erreur.

```
tests unitaires (src/tests/unit/*.test.ts)
```
→ 184 vérifications au dernier gel (OMEGA v1.0), toutes attendues vertes ; toute régression doit être investiguée avant de considérer une nouvelle version prête.

## Limite assumée de ce protocole

Le Mode Test guide et chronomètre un **testeur humain réel** dans l'application réelle — il ne peut ni s'exécuter seul, ni produire de preuve sans qu'une personne le déroule effectivement. Voir `KNOWN-LIMITATIONS.md` (§1, point 5) pour le détail de cette limite.
