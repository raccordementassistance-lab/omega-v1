# CHANGELOG — P2A.1 (Normalisation + Autocomplétion d'adresse)

Snapshot officiel figé le **2026-09-27 à 21:33 (Europe/Paris)**.
Référence avant Phase 2B. Voir `P2A1-RESULTATS.md` pour les preuves d'exécution complètes.

## Corrigé
- **Bug des apostrophes typographiques** (`’`, `‘`, `´` non reconnues comme `'`) : cassait la reconnaissance de phrases tapées avec la frappe intelligente par défaut des claviers mobiles (iPhone en particulier), notamment `c'est bon` (récapitulatif) et `pas d'accord` (mandat). Corrigé dans `normalize()`, alignée dans les trois fichiers qui la dupliquaient (`engine.ts`, `orchestrator.ts`, `extraction.ts`).
- **Perte de l'adresse envoyée en plusieurs messages** : l'étape `ADDRESS` évaluait chaque message isolément et oubliait tout fragment précédent (ex. « 42 rue Voltaire sur Onnaing » puis « 59264 » échouait deux fois). `engine.ts` mémorise désormais le fragment (`addressDraft`) et le recombine avec le message suivant, toujours revalidé par le même motif d'adresse inchangé (`hasCompleteAddress`), jamais une validation séparée ou plus permissive.

## Ajouté
- `src/lib/lydie/addressSuggestions.ts` : service optionnel d'interrogation de la Base Adresse Nationale (BAN), avec repli automatique (`source: "UNAVAILABLE"`) sur toute erreur réseau, timeout ou réponse invalide — jamais bloquant, jamais appelé depuis `stepLydie()` (qui reste une fonction pure, sans accès réseau, comme documenté). **Non branché à l'API/l'interface dans cette version** — architecture posée, intégration UI hors périmètre de cette passe.
- Suite de tests dédiée : `lydie-apostrophe-and-address-completion.test.ts` (10 tests), `lydie-address-suggestions.test.ts` (7 tests).

## Modifié
- `LydieContext` (`engine.ts`) : nouveau champ `addressDraft: string | null`, propagé dans `INITIAL_LYDIE_CONTEXT`, `resume.ts#deriveLydieContextFromDossier` (toujours `null` — un dossier repris n'a jamais de fragment en attente) et le schéma Zod de `route.ts` (rétrocompatible, `.optional()` + `.transform` vers `null`).

## Inchangé (confirmé)
- J20 (`state-machine-engine.ts`, `transitionDossierInTransaction`, `assertGuards`)
- Prisma (client, requêtes, `schema.prisma`)
- Mandat (3 consentements, matérialisation `MANDAT_SIGNE`)
- Optimistic locking (`Dossier.version`)
- `parseAddress.ts` (parseur d'adresse à la persistance — motif non modifié)
- Architecture Lydie V2 (Orchestrateur → Extraction → Contexte → Reasoning) — seule sa fonction `normalize()` dupliquée a reçu le même correctif d'apostrophe

## Non résolu / hors périmètre de cette version
- Appel réel à la BAN (réseau indisponible dans cet environnement de développement — architecture prête, non exercée avec de vraies données).
- Interface de sélection d'une suggestion d'adresse par le client.
- Compilation/exécution complètes de `route.ts` (dépendances non installables ici).
