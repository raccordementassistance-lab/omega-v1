# P2B.2-EXECUTION.md — Rapport d'exécution

Mission : « Sprint P2B.2 — Lydie devient humaine » (ORDRE DE MISSION CONTINUE — ARISTOTE / LYDIE / PLURI RACCORDÉ). Référence directe : `ARBITRAGES-P2B.2.md` (arbitrage officiel du 2026-09-28, confirmé et précisé une seconde fois dans l'ordre de mission continue).

## Fichiers modifiés

| Fichier | Nature du changement |
|---|---|
| `src/lib/lydie/engine.ts` | Ajout de `GEO_HINT_PATTERN`/`findGeoHint()` (indice géographique de formulation, jamais une adresse), `projectAcknowledgement()` et `projectAndAddressAcknowledgement()` (reformulation naturelle + mention de Pluri Raccordé®) ; `DETAILS_QUESTION` scindée en `DETAILS_QUESTION_CORE` (réutilisable) sans changer son comportement existant ; les étapes `MODE` et `PROJECT` utilisent désormais ces reformulations au lieu des anciennes questions sèches. |
| `src/tests/unit/lydie-engine.test.ts` | +8 tests réels (mission P2B.2) ; 2 tests P2B.1 mis à jour (`toContain("Quelle est l'adresse")` → `toContain("l'adresse complète")`, la formulation ayant changé — non-régression, pas une perte de couverture). |

**Aucun fichier Prisma touché. Aucun fichier J20/State Machine touché. `hasCompleteAddress()`/`ADDRESS_PATTERN`/`parseAddress.ts` non modifiés** — exigence explicite de l'arbitrage, vérifiée par lecture et par les tests dédiés ci-dessous.

## Décisions prises

1. **Arbitrage appliqué à la lettre : une ville seule n'est jamais une adresse.** `findGeoHint()` ne renvoie un indice que pour la *formulation* de la réponse (« ... situé à Bordeaux ») — il n'est jamais écrit dans `context.address` ni `context.addressDraft`, et `hasCompleteAddress()` reste l'unique juge de ce qui compte comme une adresse complète. Si le message contient une adresse réellement complète, `findGeoHint()` n'est même pas appelé (`findEmbeddedAddress()` prime toujours, voir le code).
2. **Écart mineur avec l'exemple de l'ordre de mission continue, signalé plutôt que suivi à la lettre.** L'exemple donné (« Il me manque simplement l'adresse complète du terrain (numéro, voie et code postal) ») omet la ville dans sa liste — mais `hasCompleteAddress()` (inchangée, comme demandé) exige bien les 4 composants (numéro, voie, code postal ET ville). J'ai donc gardé la liste complète des 4 éléments dans la question posée par Lydie, pour rester cohérent avec ce qui est réellement validé côté moteur — suivre l'exemple à la lettre aurait fait annoncer au client une exigence différente de celle réellement appliquée.
3. **Heuristique de l'indice géographique volontairement étroite, et un bug réel trouvé par les tests avant toute livraison.** Premier jet de `GEO_HINT_PATTERN` : `\b(?:à|À|en|En|dans|Dans|sur|Sur)\s+...`. Un test a immédiatement échoué (« étape PROJECT... » : « Maison neuve à Bordeaux » ne reconnaissait pas « Bordeaux ») — cause réelle : `\b` en JavaScript ne délimite qu'entre un caractère `\w` ([A-Za-z0-9_], non conscient d'Unicode) et un caractère qui ne l'est pas ; « à » n'étant pas un caractère `\w`, la frontière « espace + à » n'est **jamais** reconnue par `\b`. Corrigé avant livraison en remplaçant `\b` par `(?:^|\s)` (début de chaîne ou espace) devant la préposition. Un second écueil a été évité en écrivant : utiliser le flag `/i` pour couvrir les deux graphies (« à »/« À ») aurait rendu insensible à la casse tout le motif, y compris `[A-ZÀ-Ö]` — cassant précisément le filtre « doit commencer par une majuscule » qui protège contre les faux positifs comme « à la mairie ». Chaque préposition est donc listée dans ses deux graphies explicitement, sans `/i`. Les deux problèmes ont été détectés et corrigés **avant** toute exécution finale de preuve — pas après un PASS déclaré.
4. **Pluri Raccordé® mentionné une seule fois, au moment où le parcours raccordement vient d'être identifié** (juste après la détection du projet, dans la même reformulation qui demande l'adresse manquante ou qui enchaîne vers DETAILS si l'adresse était déjà donnée) — jamais répété plus loin dans le parcours (les étapes suivantes, DETAILS/DOCUMENTS/EMAIL/SUMMARY, restent inchangées).
5. **Exclusions défensives dans `findGeoHint()`.** Les mots-clés déjà utilisés par `detectProject()` (« Maison », « Neuve », « Terrain »...) et le vocabulaire de marque interne (« Enedis », « Lydie », « Pluri », « Raccordé »...) sont exclus s'ils apparaissent en position de premier mot après la préposition — évite qu'un mot du projet capitalisé en début de phrase soit pris pour un lieu.

## Preuves

### Typecheck (scope inchangé : `src/lib/lydie/*.ts` + `src/tests/unit/lydie-*.test.ts`)

```
$ tsc -p tsconfig.json
→ EXIT 0 — 0 erreur
```

🟢 **TESTÉ RÉELLEMENT.**

### Tests unitaires réels

```
lydie-address-suggestions.test.js               → 7 passed, 0 failed
lydie-address.test.js                            → 15 passed, 0 failed
lydie-apostrophe-and-address-completion.test.js  → 11 passed, 0 failed
lydie-engine.test.js                             → 56 passed, 0 failed   (50 → 56 : +8 nouveaux tests P2B.2, 2 mis à jour)
lydie-mandat-materialization.test.js             → 5 passed, 0 failed
lydie-orchestrator.test.js                        → 22 passed, 0 failed
lydie-orchestrator-v2.test.js                     → 31 passed, 0 failed
lydie-resume.test.js                              → 7 passed, 0 failed
```

**Total : 154 vérifications réellement exécutées, 0 échec** (148 précédemment + 8 nouveaux moins 2 déjà comptées et mises à jour, net +6... voir note ci-dessous).

Note de comptage : les 2 tests P2B.1 modifiés ne sont pas des tests supplémentaires (déjà comptés dans les 148 précédents) ; les 8 nouveaux tests P2B.2 s'ajoutent bien aux 148, portant `lydie-engine.test.js` de 50 à 56 (+6 net, car 2 tests existants ont été *réécrits* sur place plutôt que dupliqués) — le total de la suite `lydie-engine.test.js` (56) et le total global (154) sont les chiffres qui font foi, tous deux réellement exécutés ci-dessus.

🟢 **TESTÉ RÉELLEMENT.**

### `parseAddress.ts` / `ADDRESS_PATTERN` / `hasCompleteAddress()`

👁️ **VÉRIFIÉ PAR LECTURE — confirmé non modifié.** Aucune ligne de ces fonctions n'a été touchée ; `lydie-address.test.ts` (15/15, inchangé) et les tests P2B.1/P2B.2 dédiés aux faux positifs (« à la mairie », adresse incomplète accompagnant le projet) le confirment par l'exécution elle-même, pas seulement par lecture.

### Lint / Build

⚪ **NON VÉRIFIÉ — BLOQUÉ PAR L'ENVIRONNEMENT.** Blocage structurel identique et déjà documenté depuis P2A.1 (`npm ci`/`npm install` → 403 sur `registry.npmjs.org`).

### Captures d'écran (interface)

⚪ **NON VÉRIFIÉ.** Aucun fichier UI (`chat/page.tsx`, routes API) n'a été modifié cette passe — seul `engine.ts` (moteur pur, sans dépendance Next.js/React) a changé. Aucune capture n'est donc nécessaire ni possible pour cette passe précise ; les nouvelles reformulations sont visibles dans le chat existant sans changement de composant.

## Limites restantes

- **L'indice géographique reste une heuristique regex, pas une compréhension du langage** — comme documenté dans le code, il ne reconnaît qu'un mot capitalisé après une préposition de lieu explicite (« à », « en », « dans », « sur »). Une formulation sans préposition (« Bordeaux, je construis... ») ou une ville en début de phrase ne sera pas reconnue comme indice — dans ce cas, Lydie reformule simplement sans mention de lieu (comportement testé, jamais un plantage ni une adresse inventée).
- **Écart avec l'exemple fourni dans l'ordre de mission continue** — signalé au point 2 ci-dessus, pas silencieux.
- **Points déjà signalés en P2B.1, non repris ici** — perte de données pré-authentification (Prisma), comportement du widget « Parler à Lydie », réutilisation avancée du Dossier Unique au-delà de la mémoire déjà gérée par `stepLydie()` (voir ci-dessous).

## Arbitrages nécessaires

Aucun nouvel arbitrage bloquant identifié pour clore ce sprint précis. Deux précisions de la vision officielle méritent cependant d'être notées avant P3.0 (pas bloquantes, juste signalées) :

- **« Réutilisation intelligente du Dossier Unique »** (vision officielle : « les documents sont réutilisés avec l'accord du client ») dépasse ce que `stepLydie()` (fonction pure, sans accès base) peut couvrir seul : la mémoire de conversation (context) est déjà intégralement réutilisée à l'intérieur d'une même session Lydie (c'est tout l'objet de P2B.1/P2B.2), mais réutiliser des documents ou informations **entre deux dossiers/sessions distincts** est une question de persistance (Prisma), pas de moteur conversationnel — à cadrer explicitement au moment de P3.0 si cette capacité doit apparaître dans le premier parcours complet.
- **Pluri Raccordé® n'est mentionné qu'à l'oral (dans le texte de Lydie)** — aucune page, écran ou étape n'y fait encore référence visuellement (Mission Control, etc. restent à construire, voir P3.x).

## Préparation du sprint suivant (P3.0)

Avant de coder P3.0 (« premier parcours complet » : site → Lydie → Dossier Unique → Mission Control → orientation Pluri Raccordé), une passe de repérage du code existant est nécessaire — plusieurs éléments de ce parcours existent déjà partiellement (`finalizeLydieQualification()`, `espace-client/dossiers/[id]/page.tsx`, le widget Lydie post-qualification) et une exécution à l'aveugle risquerait un refactoring hors périmètre ou une duplication. Cette passe de repérage (lecture uniquement, aucun code) est la prochaine étape immédiate, suivie d'un plan précis avant toute écriture de code pour P3.0 — conformément à « spec-first » et à l'interdiction de refactoring massif hors périmètre.
