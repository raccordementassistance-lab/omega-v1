# INSTALL.md — Installation OMEGA v1.0 (moins de 5 minutes)

Ce document ne modifie aucun code. Il décrit la procédure d'installation exacte, à partir des scripts et fichiers déjà présents dans le dépôt (`package.json`, `.env.example`) — rien n'a été inventé ni testé en dehors de ce que ces fichiers déclarent.

## Prérequis

- **Node.js ≥ 20** (`engines.node` dans `package.json`).
- **npm** (fourni avec Node).
- Un accès réseau sortant complet vers `registry.npmjs.org` (voir `KNOWN-LIMITATIONS.md` — c'est précisément ce qui manque dans l'environnement de développement Claude ; sur un poste normal ou en CI classique, ce n'est pas un problème).
- Une base **PostgreSQL** accessible (ex. Supabase — le projet est déjà configuré pour Supabase, voir ci-dessous) si tu veux utiliser les fonctionnalités qui écrivent en base (création de dossier, authentification). Le chat Lydie seul (moteur pur) ne nécessite pas de base pour être exploré au niveau du code.

## Étapes

### 1. Extraire le ZIP et se placer dans le dossier

```bash
unzip omega-v1.0-gold-master.zip
cd omega
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Puis renseigner dans `.env` (valeurs réelles à obtenir auprès d'Aristote / du projet Supabase) :

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | Connexion PostgreSQL (Supabase, avec pooling `pgbouncer=true`) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé serveur Supabase (jamais exposée côté client) |
| `RESEND_API_KEY` | Envoi d'e-mails transactionnels (optionnel pour explorer le MVP) |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` en local |

### 4. Générer le client Prisma

```bash
npx prisma generate
```

### 5. Appliquer le schéma à la base (si tu disposes d'une base PostgreSQL configurée)

```bash
npx prisma migrate deploy
```

### 6. Lancer le projet

Voir `RUN-LOCAL.md` pour la commande exacte et ce que tu dois voir.

## Ce qui n'a volontairement pas été testé pour produire ce document

Cette procédure suit exactement les scripts déclarés dans `package.json` (`npm install`, `prisma generate`, `prisma migrate deploy`, `next dev`). Elle n'a pas pu être exécutée de bout en bout dans l'environnement de développement Claude (voir `KNOWN-LIMITATIONS.md`, blocage `npm` 403 sur le téléchargement des paquets) — c'est la même limite que celle déjà documentée pour tout le projet depuis P2A.1, pas une nouvelle incertitude. Sur un poste avec un accès npm complet, ces commandes sont les commandes standard d'un projet Next.js + Prisma tel que configuré ici.
