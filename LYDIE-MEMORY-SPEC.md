# Spécification — Mémoire d'adresse de Lydie (`addressDraft`)

Document de préparation, **aucun code modifié par ce document**. Décrit le comportement exact déjà implémenté dans `src/lib/lydie/engine.ts` (P2A.1) pour la fusion d'une adresse envoyée en plusieurs messages.

## 1. Fonctionnement de `addressDraft`

- Champ du type `LydieContext` : `addressDraft: string | null`.
- Rôle unique : mémoriser un fragment de texte d'adresse déjà reçu, mais encore incomplet au sens de `hasCompleteAddress()`, en attendant le ou les messages suivants qui pourraient le compléter.
- Vit uniquement pendant l'étape `ADDRESS` de la conversation en cours ; n'est jamais lu ni écrit par aucune autre étape (`MODE`, `PROJECT`, `DETAILS`, `DOCUMENTS`, `EMAIL`, `SUMMARY`, `MANDAT`, `DONE`) sauf le cas de remise à zéro explicite décrit au §4.
- Initialisé à `null` dans `INITIAL_LYDIE_CONTEXT` — une conversation qui démarre n'a jamais de fragment en attente.
- Jamais reconstruit à la reprise d'un dossier existant : `deriveLydieContextFromDossier()` (`resume.ts`) le renvoie systématiquement à `null`, avec le commentaire explicite dans le code : « cette notion n'existe que côté conversation en cours ».

## 2. Séquence exacte à l'étape `ADDRESS`

À chaque message reçu pendant l'étape `ADDRESS`, dans cet ordre :

1. **Le message seul est-il une adresse complète ?** (`hasCompleteAddress(text)`) → si oui, utilisé directement, `addressDraft` remis à `null`. C'est le chemin historique, inchangé, pour un client qui tape son adresse en un seul message.
2. **Sinon, y a-t-il un fragment en attente (`context.addressDraft !== null`) ?** → si oui, `buildAddressMergeCandidates(context.addressDraft, text)` génère jusqu'à 3 recombinaisons textuelles candidates (voir §3), et la première qui satisfait `hasCompleteAddress()` est retenue comme adresse finale ; `addressDraft` remis à `null`.
3. **Sinon** (ni le message seul, ni aucune recombinaison avec le fragment précédent, n'est une adresse complète) → le texte du message est fusionné dans `addressDraft` (nouveau fragment = candidat de fusion le plus simple avec l'ancien, ou le message lui-même si `addressDraft` était `null`), et Lydie redemande l'adresse en précisant explicitement au client qu'il peut l'envoyer en plusieurs messages.

Important : **aucune étape de cette séquence n'assouplit `hasCompleteAddress()` / `ADDRESS_PATTERN`**. La fusion produit uniquement des candidats textuels ; c'est toujours le même parseur, inchangé, qui décide si le résultat est une adresse valide.

## 3. Règles de fusion (`buildAddressMergeCandidates`)

Étant donné `draft` (fragment précédent, ou `null`) et `text` (nouveau message), la fonction produit jusqu'à 3 candidats, essayés dans cet ordre par `.find(hasCompleteAddress)` :

1. **Concaténation avec virgule** : `` `${draft}, ${text}` `` — couvre le cas où le fragment et le complément forment une adresse correcte séparés par une virgule (ex. fragment "42 rue Voltaire sur Onnaing" + complément "59264" → `"42 rue Voltaire sur Onnaing, 59264"`, qui peut ensuite matcher `ADDRESS_PATTERN` si la ville est reconnaissable dans le fragment).
2. **Concaténation avec espace** : `` `${draft} ${text}` `` — couvre le cas où aucune virgule n'est nécessaire pour que le motif reconnaisse les composants.
3. **Insertion du complément avant le dernier mot du fragment** : traite le cas où le complément (souvent un code postal isolé) doit s'insérer avant le nom de ville plutôt qu'à la toute fin — ex. fragment "42 rue Voltaire sur Onnaing" (le dernier mot "Onnaing" est la ville) + complément "59264" → tentative `"42 rue Voltaire sur 59264 Onnaing"`.

Si `draft` est `null` (aucun fragment en attente), le seul « candidat » est le texte du nouveau message lui-même — ce qui revient au chemin normal du §2.1.

Chaque candidat est **toujours** revalidé par `hasCompleteAddress()` avant d'être accepté ; un candidat qui ne matche pas `ADDRESS_PATTERN` est simplement écarté, jamais forcé.

## 4. Règles de remplacement

- `addressDraft` n'est **jamais remplacé silencieusement par une valeur devinée** : soit une recombinaison passe la validation stricte du parseur et devient l'adresse finale (puis `addressDraft` → `null`), soit aucune ne passe et le nouveau fragment remplace l'ancien `addressDraft` (le nouveau message est incorporé, mais uniquement comme texte brut en attente, jamais interprété).
- Il n'existe pas de mécanisme de correction automatique d'un fragment déjà stocké (ex. le client se trompe et retape une adresse différente) : chaque nouveau message qui ne complète pas immédiatement à une adresse valide vient s'ajouter au fragment existant. **Cas limite non résolu** (voir §6) : un client qui change complètement d'adresse en cours de saisie multi-messages verra son ancien fragment concaténé avec le nouveau, ce qui peut produire un texte incohérent que le parseur rejettera simplement (comportement sûr — jamais une adresse fausse acceptée — mais pas nécessairement une bonne expérience utilisateur).

## 5. Remise à zéro

`addressDraft` est remis à `null` dans exactement 3 cas, tous déjà implémentés :

1. **Succès** : une adresse complète est obtenue (message seul ou fusion réussie) — §2.1 et §2.2.
2. **Modification depuis le récapitulatif** : à l'étape `SUMMARY`, quand le client demande à modifier l'adresse (`addressDraft: null` explicitement ajouté à la reconstruction du contexte dans cette branche), pour repartir sur une saisie propre sans qu'un ancien fragment abandonné ne vienne interférer avec la nouvelle saisie.
3. **Reprise d'un dossier existant** : `deriveLydieContextFromDossier()` renvoie toujours `addressDraft: null` — un dossier chargé depuis la base n'a par définition aucune conversation en cours, donc aucun fragment en attente possible.

## 6. Changement de projet

- `addressDraft` est un champ de l'étape `ADDRESS` uniquement ; un changement de `project` (type de projet Lydie) intervient à l'étape `PROJECT`, avant `ADDRESS` dans le flux normal — dans ce cas, `addressDraft` reste simplement à sa valeur initiale (`null`), aucune interaction particulière nécessaire.
- **Cas limite non explicitement testé** : un client qui reviendrait modifier son type de projet depuis le récapitulatif (`SUMMARY`) alors qu'un `addressDraft` non vide existait déjà (avant d'atteindre `SUMMARY`, ce qui ne devrait normalement pas arriver puisque `ADDRESS` doit être résolu avant `DETAILS`/`SUMMARY`) — dans la pratique, `addressDraft` ne peut être non-`null` qu'en plein milieu de l'étape `ADDRESS` elle-même ; comme cette étape doit être terminée (adresse complète obtenue) pour progresser vers les étapes suivantes, ce scénario n'est normalement pas atteignable. Non vérifié par un test dédié — signalé ici plutôt que supposé sûr sans preuve (voir `TECH-DEBT-P2A1.md`).

## 7. Cas limites

| Cas | Comportement actuel | Statut |
|---|---|---|
| Adresse complète en un seul message | Utilisée directement, `addressDraft` reste `null` | 🟢 Testé réellement |
| Adresse en 2 messages (voie+ville, puis code postal) | Fusionnée via un des 3 candidats, `addressDraft` → `null` après succès | 🟢 Testé réellement |
| Adresse en 3 messages | Fusion progressive (fragment enrichi à chaque message tant qu'incomplet) | 🟢 Testé réellement (cas bonus) |
| Fragments incohérents (ex. deux adresses différentes concaténées) | Rejeté par `hasCompleteAddress()`, jamais accepté comme adresse valide ; le client est redemandé | 🟢 Testé réellement (fragments incohérents jamais acceptés) |
| Modification d'adresse depuis SUMMARY | `addressDraft: null` explicite dans la reconstruction du contexte | 🟢 Testé réellement |
| Dossier repris (autre appareil, cache vidé) | `addressDraft` toujours `null`, jamais reconstruit depuis la base | 🟢 Testé réellement |
| Changement de type de projet avec `addressDraft` non vide en attente | Non atteignable dans le flux actuel (ADDRESS doit être résolu avant SUMMARY) | ⚪ NON VÉRIFIÉ — raisonnement structurel, pas de test dédié |
| Client qui abandonne un fragment et recommence une adresse totalement différente | Concaténé avec l'ancien fragment ; si incohérent, rejeté et redemandé (jamais une adresse fausse acceptée) ; pas de bouton/commande explicite "annuler le fragment en cours" | ⚪ NON VÉRIFIÉ / amélioration possible — pas un bug de sécurité (rien n'est faussement accepté), mais un point d'UX à discuter en P2B |
| Sélection d'une suggestion BAN (P2B, non construit) | Le `label` de la suggestion serait envoyé comme message normal, donc repasserait par cette même logique de fusion/validation | Prévu, non implémenté (voir `BAN-INTEGRATION-PLAN.md`) |
