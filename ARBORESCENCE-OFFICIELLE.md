# ARBORESCENCE-OFFICIELLE.md — Proposition de structure documentaire

**Proposition uniquement — rien n'est déplacé ni créé sur le disque par ce document.** Aucun fichier existant n'est touché tant que cette structure n'est pas validée par Aristote, conformément à la consigne explicite de la mission (« Ne rien déplacer tant que cette structure n'est pas validée »).

## Structure proposée (par catégorie, sur demande explicite de cette mission)

```
docs/
 ├── boot/
 ├── rfc/
 ├── adr/
 ├── reports/
 ├── tech-debt/
 ├── vision/
 ├── academy/
 └── passation/
```

Cette structure organise **par catégorie de document** (ce qu'est le document), à la différence de la structure provisoire précédemment esquissée dans `DOC-INDEX.md` v1 (avant cette mission), qui listait des **fichiers nommés individuellement** à plat sous `docs/` (`LZ-000-...`, `PB-001-...`, `ADR/ADR-0001.md`, etc.). Les deux logiques ne sont pas incompatibles, mais elles ne se superposent pas automatiquement — voir §2.

## 1. Contenu prévu par dossier (proposition, non appliquée)

| Dossier | Contenu prévu |
|---|---|
| `docs/boot/` | `BOOT.md` (actuellement à la racine du dépôt — un déplacement éventuel devra confirmer si `BOOT.md` reste aussi accessible à la racine, un point d'entrée enterré dans un sous-dossier étant contraire à sa fonction même) |
| `docs/rfc/` | Futurs RFC (numérotation non encore définie — voir `CEO-AUDIT-OMEGA.md` §2.3) |
| `docs/adr/` | `ADR-001` à `ADR-005` (brouillons, actuellement dans `adr-drafts/` à la racine — voir §3), `ADR-0001` à `ADR-0006` (mentionnés par `MASTER-RUNBOOK-V1`, contenu non défini) |
| `docs/reports/` | `P2A1-RESULTATS.md`, `CEO-AUDIT-OMEGA.md`, `OMEGA-DOC-LOCK-v1.md` (actuellement à la racine) |
| `docs/tech-debt/` | `TECH-DEBT-P2A1.md` (référence officielle), `TECH-DEBT-VISION-ARISTOTE-ONE.md` (si créé un jour, voir `NOMENCLATURE-LOCK.md`) |
| `docs/vision/` | `VISION-TO-EXECUTION.md`, une éventuelle copie/référence de `PASSATION OFFICIELLE — ARISTOTE ONE OMEGA v1` (actuellement conceptuel, jamais copié dans le dépôt — voir §4) |
| `docs/academy/` | Aucun contenu identifié à ce jour dans aucune pièce reçue — dossier proposé vide, en réservation de nom |
| `docs/passation/` | Aucun contenu identifié à ce jour dans aucune pièce reçue — dossier proposé vide, en réservation de nom ; pourrait accueillir `MASTER-RUNBOOK-V1` et `PASSATION OFFICIELLE` une fois formalisés comme fichiers réels |

## 2. Fichiers non couverts par cette structure par catégorie

Les fichiers suivants, nommés dans `MASTER-RUNBOOK-V1` avec une arborescence différente (`docs/` à plat), n'ont pas de dossier de catégorie évident dans la structure ci-dessus, et nécessiteront un arbitrage explicite avant tout classement :

- `LZ-000-CONSTITUTION-LYDIE-V1.md`, `LZ-001-REGLE-3-SECONDES.md` — relèvent-ils de `vision/` (constitution = vision fondatrice) ou d'un futur `docs/lydie/` non prévu dans la structure demandée ici ?
- `PB-001-PRODUCT-BOOK-V1.md`, `LV1-000-BIBLE-VISUELLE-V1.md`, `ADN-001.md`, `PMO-001.md` — même question : `vision/`, ou catégories absentes de la liste demandée.
- `DECISION-LOG.md`, `RISK-REGISTER.md` — pourraient relever de `reports/` (traçabilité) ou de `tech-debt/` (risques) ; à trancher.

**Ce document ne tranche pas ces classements** — il les signale pour que l'arbitrage se fasse une fois, explicitement, plutôt que fichier par fichier au fil des créations.

## 3. Emplacement actuel des livrables de cette mission (avant toute application de cette structure)

Tant que cette arborescence n'est pas validée, les livrables produits restent à la racine de `/home/claude/omega/` (documents) et dans `/home/claude/omega/adr-drafts/` (brouillons ADR — dossier neutre, choisi précisément pour ne pas présupposer `docs/adr/` avant validation).

## 4. `academy/` et `passation/` — absence de contenu source

Contrairement aux autres catégories, `academy/` et `passation/` ne correspondent à aucun contenu déjà mentionné dans les pièces reçues (`MASTER-RUNBOOK-V1`, `PASSATION OFFICIELLE`, ou les échanges antérieurs). Ils apparaissent uniquement dans l'énoncé de cette mission. Proposés ici comme dossiers réservés (noms retenus, contenu à définir), plutôt qu'omis comme cela avait été fait dans la première hypothèse de `DOC-INDEX.md` (avant cette mission, où l'absence de source avait conduit à ne pas les inclure du tout) — cette mission demandant explicitement leur présence, ils sont maintenant intégrés à la proposition, mais vides.

## 5. Ce que cette proposition ne fait pas

- Elle ne déplace aucun fichier existant.
- Elle ne crée aucun dossier sur le disque.
- Elle ne tranche pas le classement des fichiers nommés individuellement dans `MASTER-RUNBOOK-V1` (§2).
- Elle ne décide pas si `BOOT.md` doit quitter la racine du dépôt pour `docs/boot/` — recommandation implicite de ne pas le faire (un point d'entrée doit rester immédiatement visible), à confirmer explicitement par Aristote.
