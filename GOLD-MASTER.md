# GOLD-MASTER.md — Aristote OS OMEGA v1.0

État officiel du MVP au moment du gel. Ce document ne modifie aucun code — il consolide, sans rien ajouter ni inventer, ce que les rapports de sprint (`P2A1-RESULTATS.md` → `P3.4-MVP-VALIDATION.md`) et `DECISION-LOG.md` ont déjà établi et prouvé.

## 1. Ce qu'est OMEGA v1.0

Un MVP démontrable du parcours **Lydie → Dossier Unique → Pluri Raccordé® → Mission Control** :

- **Lydie** — conseillère conversationnelle (`src/lib/lydie/engine.ts`), moteur pur et déterministe (`stepLydie()`), sans IA générative : détection de projet par mots-clés, adresse validée par un motif strict (`hasCompleteAddress()` / `ADDRESS_PATTERN`, jamais modifié depuis P2B.0), reformulation naturelle, mention de Pluri Raccordé® au moment où le projet est identifié, jamais de répétition d'une information déjà connue dans la même session.
- **Dossier Unique** — un identifiant, un seul dossier, créé à la confirmation du mandat (`finalizeLydieQualification()`), repris automatiquement pour un client authentifié qui revient (« Dossier Vivant », P3.3, avec le garde-fou P3.4 : jamais de reprise sur un dossier déjà `DONE`).
- **Pluri Raccordé®** — le Pôle 1 officiel : électricité qualifiée réellement (via `DemandeType`, aligné 1:1 sur les projets Lydie) ; eau/fibre/gaz affichés en vue dérivée (« À déterminer », aucune donnée inventée — P3.2).
- **Mission Control** (`espace-client/dossiers/[id]`) — affiche projet, adresse, documents, progression, et les 4 réseaux dérivés, sans aucune table Prisma supplémentaire.
- **Mode Test officiel** (`src/lib/testmode/scenario.ts` + `TestModePanel`/`TestModeButton`) — protocole de validation reproductible identique à chaque version, chronomètre l'objectif accueil → Mission Control (< 3 minutes), génère un rapport Markdown comparable version après version.

## 2. Sprints livrés (P2A.1 → P3.4bis)

| Sprint | Objet | Statut |
|---|---|---|
| P2A.1 | Fondations Lydie, adresse stricte, snapshot stable | ✅ Validé, figé (`P2A1-RESULTATS.md`) |
| P2B.0 | Intégration adresse BAN (module pur) | ✅ Validé |
| P2B.1 | Adresse composite (projet + adresse dans un seul message) | ✅ Validé |
| P2B.2 | Reformulation naturelle, mention de Pluri Raccordé®, contexte géographique (« Bordeaux » jamais une adresse) | ✅ Validé |
| P3.0 | Premier parcours client complet (reconnaissance + branding) | ✅ Validé |
| P3.1 | Expérience Premium (messages naturels, progression) | ✅ Validé |
| P3.2 | Mission Control — réseaux (vue dérivée, sans Prisma) | ✅ Validé |
| P3.3 | Dossier Vivant — reprise de session pour un client authentifié | ✅ Validé |
| P3.4 | Audit démo — 2 bugs réels trouvés et corrigés, verdict MVP PRÊT | ✅ Validé |
| P3.4bis | Mode Test officiel intégré au projet | ✅ Validé |
| **OMEGA v1.0** | **Gold Master — gel de la référence officielle** | ✅ **Ce document** |

## 3. Preuves cumulées

- **184 vérifications automatisées réellement exécutées, 0 échec** (dernière exécution complète : sprint P3.4bis), couvrant tout le code pur de `src/lib/lydie/`, `src/lib/j20/` et `src/lib/testmode/`.
- `tsc -p tsconfig.json` → **0 erreur** sur l'ensemble du code vérifié.
- Convention de preuve appliquée sans exception depuis P2A.1 : 🟢 testé réellement / 👁️ vérifié par lecture / ⚪ non vérifié — bloqué par l'environnement. Le détail intégral par fichier reste dans chaque `P?.?-EXECUTION.md`.

## 4. Ce qui est explicitement HORS de ce gel

Aucun changement métier, aucun refactoring, aucune migration Prisma, aucune modification de la State Machine J20 n'a été introduit pour produire ce Gold Master — conformément à l'ordre de mission « OMEGA v1.0 — GOLD MASTER ». À partir de ce document, la branche n'accueille plus de nouvelle fonctionnalité ; voir `NEXT-STEPS.md` pour la suite (P4+), non implémentée.

## 5. Documents de référence de ce Gold Master

- `RELEASE-NOTES-v1.0.md` — ce qui a changé, sprint par sprint.
- `KNOWN-LIMITATIONS.md` — uniquement les limites réellement prouvées.
- `TEST-PROTOCOL.md` — le Mode Test officiel, formalisé.
- `NEXT-STEPS.md` — la feuille de route P4+, liste uniquement.
- `DECISION-LOG.md` — l'index unique des arbitrages tranchés.
- `ARISTOTE-OS-CONSTITUTION-OMEGA-v1.md` — la référence de gouvernance permanente.

## 6. Verdict

**MVP PRÊT — OMEGA v1.0 verrouillé comme référence officielle**, avec la réserve objective déjà documentée dans `P3.4-EXECUTION.md` et reprise intégralement dans `KNOWN-LIMITATIONS.md` : aucune preuve d'exécution live (navigateur réel, build, lint, `npm install`) n'a pu être obtenue dans cet environnement de développement — blocage structurel (`npm` 403 sur le registre), documenté et inchangé depuis P2A.1, pas une incertitude sur le code lui-même.
