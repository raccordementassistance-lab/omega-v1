# DEPLOY-VERCEL.md — Déploiement Preview sans modifier le code

Le projet est un Next.js 15 standard (`next.config.ts` sans configuration exotique, aucun `vercel.json` présent ni nécessaire) — Vercel le détecte automatiquement. Ce document ne demande aucun changement de code.

## Option A — le plus rapide : CLI Vercel

```bash
npm install -g vercel   # une seule fois
cd omega
vercel login             # ouvre le navigateur, connecte ton compte Vercel
vercel                    # déploie une Preview, pose quelques questions (accepter les valeurs par défaut)
```

Vercel affiche une URL de type `https://omega-xxxxxxxx.vercel.app` — c'est l'URL de test à ouvrir sur iPhone.

## Option B — sans rien installer : import GitHub

1. Pousser ce ZIP (extrait) dans un dépôt GitHub (privé ou public) que tu contrôles.
2. Sur [vercel.com](https://vercel.com) → **Add New → Project → Import Git Repository**.
3. Sélectionner le dépôt. Vercel détecte Next.js automatiquement — aucun réglage de build à changer.
4. Renseigner les variables d'environnement (mêmes que `.env`, voir `INSTALL.md`) dans l'écran **Environment Variables** avant de cliquer sur **Deploy**.
5. Chaque push génère automatiquement une URL Preview.

## Variables d'environnement à renseigner sur Vercel

Identiques à `.env` (voir `INSTALL.md`) : `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL` (mettre l'URL Vercel une fois connue, ou laisser Vercel la déduire si le projet le permet).

## Base de données pour une Preview

La Preview a besoin d'accéder à une vraie base PostgreSQL (Supabase recommandé, le projet est déjà configuré pour). Deux options, sans toucher au code :
- Pointer `DATABASE_URL` vers le projet Supabase de développement existant, si Aristote en a déjà un.
- Créer un nouveau projet Supabase (gratuit) dédié aux tests, et y appliquer le schéma avec `npx prisma migrate deploy` depuis un poste ayant accès à `DATABASE_URL`.

## Ce que ce document ne fait pas

- Il ne déploie rien lui-même — l'exécution de `vercel` (Option A) ou la connexion du dépôt (Option B) doit être faite par une personne disposant d'un compte Vercel, hors de l'environnement de développement Claude (voir `KNOWN-LIMITATIONS.md` : aucun identifiant Vercel, aucun accès réseau vers `vercel.com` depuis cet environnement).
- Il ne modifie aucun fichier du projet : aucun `vercel.json` n'est nécessaire, Next.js est détecté nativement.
