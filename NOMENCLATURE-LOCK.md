# NOMENCLATURE-LOCK.md — Verrouillage des identifiants

Document de préparation, **aucun fichier `.ts` en écriture, aucun changement Prisma/J20/State Machine**. Ce document remplace `IDENTIFIANTS-RENOMMAGE.md` comme référence décisionnelle : ce dernier reste conservé tel quel comme trace de l'analyse détaillée (comparaison complète des deux sens de chaque collision), mais c'est **ce fichier** qui porte les décisions verrouillées, sur instruction directe d'Aristote (« ORDRE DE MISSION — OMEGA DOCUMENTATION (AUTONOME) », §4, « Décisions minimales »).

## Principe : un identifiant = un seul document

Verrouillé dans cette mission, formalisé dans le brouillon `ADR-005` (`adr-drafts/ADR-005-un-identifiant-un-document.md`). À partir de cette version, aucun code officiel ne doit réutiliser un identifiant déjà attribué à un autre document sans passer par une mise à jour explicite de ce fichier.

## Décisions verrouillées

### 1. `TECH-DEBT-P2A1.md` — référence officielle confirmée

- **Verrouillé** : le fichier `TECH-DEBT-P2A1.md` réellement présent dans ce dépôt, fondé sur les **156 vérifications réellement exécutées** du Snapshot P2A.1 STABLE, est la **référence officielle unique** de ce nom. Il n'est ni remplacé, ni fusionné, ni écrasé par aucune autre version.
- **Verrouillé** : la version conceptuelle reçue (dette technique du Kernel/AIP/Atlas/Hermès/Argentum/Mercure/Olympus — aucun code correspondant dans ce dépôt) est renommée, si et quand elle est un jour versée au dépôt, en :
  **`TECH-DEBT-VISION-ARISTOTE-ONE.md`**
  Ce fichier n'existe pas encore physiquement dans le dépôt — le renommage s'applique par anticipation, avant toute création, pour qu'aucune collision ne se produise le jour où ce contenu sera formalisé.

### 2. `LAP-001` — Asset Pack, sens unique

- **Verrouillé** : `LAP-001` désigne exclusivement le **Lydie Asset Pack** (palette officielle, espacements, halo, ombres — contenu chiffré déjà défini : `#081F4D`/`#0F4C81`/`#1E88E5`/`#F8FAFC`, rayons/padding/zone tactile 44px, etc.).
- **Verrouillé** : le principe autrefois associé au même identifiant (« Lydie ouvre la mission, le pôle spécialisé prend le relais ») cesse de porter le code `LAP-001`. Il est reformulé comme **décision d'architecture** et formalisé dans le brouillon `ADR-003` (`adr-drafts/ADR-003-pole-specialise-prend-le-relais.md`). Un principe de gouvernance/produit relève d'un ADR, pas d'un « Pack » visuel — ce n'était donc pas seulement un problème de nom, mais de catégorie de document ; la bonne catégorie est un ADR.

### 3. `LMP-001` — Motion Pack, sens unique

- **Verrouillé** : `LMP-001` désigne exclusivement le **Lydie Motion Pack** (durées d'animation : apparition carte 220ms, bouton 180ms, halo en respiration continue, Smart Loader en boucle, validation 320ms).
- **Verrouillé** : le sujet « compatibilité mémoire de Lydie » (`addressDraft`, fusion, remplacement, reset, changement de projet) ne reçoit **aucun nouvel identifiant court** — il reste désigné par son nom de fichier existant, `LYDIE-MEMORY-SPEC.md`, qui documente déjà intégralement ce sujet. Créer un code produit (`LMS-001` ou autre) pour un contenu déjà entièrement couvert par un fichier nommé serait une duplication d'identifiant sans bénéfice, contraire au principe « un identifiant = un seul document » — décision : **pas de nouveau code, référencer directement `LYDIE-MEMORY-SPEC.md`.**

### 4. `BOOT.md` — fichier racine autonome, tranché

- **Verrouillé** (déjà acté avant cette mission, reconfirmé ici) : `BOOT.md` est le fichier racine autonome et unique point d'entrée du dépôt. La section « BOOT — À LIRE EN PREMIER » de `PASSATION OFFICIELLE — ARISTOTE ONE OMEGA v1` reste un texte d'introduction interne à ce document externe, sans valeur de point d'entrée pour ce dépôt.

### 5. `AR-011` — non verrouillable en l'état

- **Non verrouillé — NON VÉRIFIABLE.** Aucune des pièces reçues à ce jour ne définit `AR-011`. Verrouiller un sens pour cet identifiant reviendrait à inventer un contenu non fourni par l'utilisateur, ce qui est explicitement interdit par la discipline de cette mission (« ne rien supposer, indiquer explicitement ce qui n'est pas vérifiable »).
- **Action requise, hors du périmètre de ce document** : demander à Aristote si `AR-011` existe dans un document du Grand Livre non encore transmis, ou s'il s'agit d'une référence anticipée à un futur numéro.

### 6. Couleur d'accent du Design System — signalé, non verrouillé (collision de valeur, pas de nom)

- **Non verrouillé.** `#1E88E5` (LAP-001, Asset Pack Lydie) et `#27C2FF` (Design System « Aristote One » global, `PASSATION OFFICIELLE` §16) restent deux valeurs différentes pour un rôle apparemment identique (« couleur d'accent »). Ce n'est pas une collision de *nom d'identifiant* (le périmètre exact de ce fichier), mais une collision de *valeur de design* — elle reste ouverte dans `VISION-TO-EXECUTION.md` §4.4, pour arbitrage visuel par Aristote (éventuellement : deux échelles distinctes, Lydie vs Aristote One global, chacune avec sa couleur).

## Table récapitulative

| Identifiant | Sens verrouillé | Sens évincé / reformulé | Nouveau document si nécessaire |
|---|---|---|---|
| `LAP-001` | Lydie Asset Pack (visuel) | Principe de relais → devient une décision d'architecture | `ADR-003` (brouillon) |
| `LMP-001` | Lydie Motion Pack (animations) | Compatibilité mémoire → déjà couverte | `LYDIE-MEMORY-SPEC.md` (existant, aucun nouveau code) |
| `TECH-DEBT-P2A1.md` | Dette technique réelle (156 vérifications) | Dette technique conceptuelle → renommée par anticipation | `TECH-DEBT-VISION-ARISTOTE-ONE.md` (à créer si besoin) |
| `BOOT.md` | Fichier racine autonome | Section interne de `PASSATION OFFICIELLE` → reste un texte, pas un point d'entrée | — |
| `AR-011` | Non défini | — | En attente de définition par Aristote |
| Couleur d'accent | Non tranché (collision de valeur) | — | Arbitrage visuel en attente |

## Ce que ce verrouillage ne fait pas

- Il ne crée aucun contenu métier nouveau pour `TECH-DEBT-VISION-ARISTOTE-ONE.md` — seul le nom est réservé par anticipation.
- Il n'invente aucun contenu pour `AR-011`.
- Il ne tranche pas la collision de couleur — signalée, pas résolue, car ce n'est pas une collision de nomenclature au sens strict.
- Il ne modifie, ne renomme et ne déplace aucun fichier existant sur le disque — les renommages listés ci-dessus s'appliquent aux futures créations, pas aux fichiers déjà en place (dont aucun ne porte aujourd'hui le nom `TECH-DEBT-VISION-ARISTOTE-ONE.md`, `LAP-001.md` ou `LMP-001.md` littéralement).
