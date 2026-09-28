# HOTFIX-001 — Erreur de build Vercel : `lydieContextSchema` (route.ts:28)

Hotfix post-Gold Master (OMEGA v1.0). Corrige un défaut bloquant le build réel sur Vercel, signalé par Aristote. Ne constitue ni une nouvelle fonctionnalité, ni un refactoring, ni une modification Prisma/State Machine.

## Constat

Le rapport transmis identifiait `src/app/api/lydie/route.ts`, ligne 28, et proposait d'ajouter `.nullable().optional()` sur le champ `addressDraft` du schéma Zod `lydieContextSchema`.

**Vérification faite avant toute correction** (POR-001 : ne jamais corriger sans avoir confirmé le constat sur le vrai code) : à la relecture, `addressDraft` porte déjà exactement ces deux modificateurs, ainsi qu'un `.transform((v) => v ?? null)`, depuis P2B.0 :

```ts
addressDraft: z.string().max(500).nullable().optional().transform((v) => v ?? null),
```

La piste transmise n'était donc pas la cause réelle — elle décrivait un symptôme déjà traité sur ce champ précis, pas la source de l'échec de build.

## Cause réelle identifiée

La ligne 28 annote le schéma avec `z.ZodType<LydieContext>` — cette syntaxe à un seul paramètre générique contraint **à la fois** l'Output et l'Input du schéma à `LydieContext`. Or, à cause du `.optional()` sur `addressDraft` (nécessaire pour accepter un ancien client n'envoyant pas encore ce champ), l'Input réel du schéma pour ce champ est `string | null | undefined`, alors que `LydieContext.addressDraft` (type utilisé aussi comme Input attendu) est `string | null`, sans `undefined`. Cette divergence entre l'Input réel du schéma et l'Input attendu par l'annotation est un piège TypeScript/Zod v3 connu — invisible dans l'environnement de développement Claude car aucun package `zod` réel n'y est installable (voir `KNOWN-LIMITATIONS.md` §1), donc jamais compilé avec les vrais types Zod avant ce jour.

## Correction appliquée

Une seule ligne modifiée — aucun champ, aucune règle métier touchée :

```ts
// avant
const lydieContextSchema: z.ZodType<LydieContext> = z.object({ ... });

// après
const lydieContextSchema: z.ZodType<LydieContext, z.ZodTypeDef, unknown> = z.object({ ... });
```

En fixant explicitement l'Input à `unknown`, on ne contraint plus que l'Output du schéma (qui, lui, correspond bien à `LydieContext`) — ce qui reflète l'usage réel : `lydieContextSchema.parse(...)` reçoit toujours du JSON brut non typé (`await request.json()`), jamais un `LydieContext` déjà validé.

## Preuve

⚪ **NON VÉRIFIÉ PAR COMPILATION RÉELLE.** Aucun package `zod` réel n'a pu être installé dans cet environnement pour reproduire l'erreur de build ni confirmer que cette correction l'élimine (`npm install zod` → 403, même blocage structurel que documenté depuis P2A.1, confirmé à nouveau à l'instant pour ce hotfix). Le diagnostic et la correction reposent sur la sémantique connue de `z.ZodType<Output, Def, Input>` en Zod v3, pas sur une exécution réelle.

**Action recommandée avant de considérer ce hotfix clos** : relancer le déploiement Vercel après avoir renvoyé ce fichier corrigé, et confirmer que l'erreur à la ligne 28 disparaît. Si une erreur différente apparaît au même endroit, le signaler avec le message exact — ne pas présumer cette correction suffisante sans ce retour.

## Fichier modifié

| Fichier | Changement |
|---|---|
| `src/app/api/lydie/route.ts` | Ligne 28 uniquement — annotation de type du schéma Zod, Input fixé à `unknown`. Aucun champ ajouté/retiré, aucune règle métier modifiée. |
