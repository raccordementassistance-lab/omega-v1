# ARBITRAGES-P2B.2.md — Décisions verrouillées avant exécution

Ce document enregistre les 4 arbitrages tranchés par Aristote sur les points laissés ouverts par `P2B.1-EXECUTION.md`, et signale un point technique non résolu avant de démarrer le sprint P2B.2 lui-même — conformément à la règle déjà appliquée tout au long de cette mission : aucune décision métier ambiguë n'est résolue silencieusement.

## Arbitrages verrouillés (2026-09-28)

| Point ouvert (P2B.1) | Décision Aristote | Statut |
|---|---|---|
| Perte de données avant authentification | Traité plus tard — pas de modification Prisma dans ce sprint | Reporté, explicitement |
| Widget « Parler à Lydie » retombant sur DONE | Corrigé plus tard, si confirmé comme un bug UX (pas encore confirmé) | Reporté, explicitement |
| Réutilisation du Dossier Unique | Lydie réutilise toutes les informations déjà validées du projet | Verrouillé — devient une exigence de P2B.2 |
| Nom « Pluri Raccordé » | Lydie peut le prononcer dès que le parcours raccordement est identifié | Verrouillé — devient une exigence de P2B.2 |

Ces deux dernières décisions cadrent directement le sprint P2B.2 : Lydie doit désormais (a) reformuler ce qu'elle a compris plutôt que de simplement enchaîner les questions, et (b) nommer « Pluri Raccordé® » une fois le projet identifié.

## Point technique non résolu — à trancher avant de coder P2B.2

L'exemple de comportement attendu fourni pour illustrer P2B.2 est :

> « Je construis une maison à Bordeaux. » → « ... J'ai déjà identifié que vous construisez une maison et que votre projet est situé à Bordeaux. ... »

**Ce message ne contient pas d'adresse complète.** `ADDRESS_PATTERN`/`hasCompleteAddress()` (fichier protégé, `parseAddress.ts`/`engine.ts`) exigent 4 composants distincts — numéro, voie, code postal, ville — précisément pour éviter les faux positifs (comportement testé explicitement : `lydie-apostrophe-and-address-completion.test.ts` → « des fragments incohérents ne sont jamais acceptés comme une adresse », et les nouveaux tests P2B.1 → « une adresse incomplète... n'est PAS acceptée »). Un nom de ville seul (« Bordeaux ») est aujourd'hui, à raison, insuffisant pour renseigner `context.address`.

Deux lectures possibles, aux implications différentes :

1. **Lecture stricte (recommandée, n'affaiblit rien de protégé) :** Lydie reconnaît « Bordeaux » comme un indice de localisation dans sa reformulation (« votre projet est situé à Bordeaux »), sans jamais le stocker comme une adresse valide ni sauter l'étape ADDRESS — elle enchaîne alors en demandant l'adresse complète, jamais la question projet redondante. C'est une évolution de formulation (ce que Lydie *dit* en confirmant ce qu'elle a compris), pas une évolution de `hasCompleteAddress()`.
2. **Lecture large :** accepter une ville seule (ou un fragment de localisation) comme suffisant pour avancer sans redemander l'adresse complète — ce qui affaiblirait directement `ADDRESS_PATTERN`, un fichier protégé, et romprait la garantie « jamais de faux positif » déjà testée. **Non recommandé sans un ADR explicite**, puisque cela toucherait une garantie qualité du dossier (une adresse à 3 composants ne peut pas être transmise à Enedis).

**Sans confirmation, j'exécuterai la lecture 1** (reformulation naturelle qui reconnaît ce qui est su, sans jamais assouplir la validation d'adresse) pour le sprint P2B.2, car c'est la seule qui respecte à la fois « aucune répétition » et « pas de changement de State Machine/validation sans justification ». Je le signale avant de coder plutôt que de le décider en silence, et je le rappellerai dans `P2B.2-EXECUTION.md`.
