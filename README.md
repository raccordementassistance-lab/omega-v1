# Raccordement Assistance — V1

Plateforme d'accompagnement aux demandes de **raccordement électrique** en France.
Service indépendant, non affilié à Enedis. Le service ne traite pas les raccordements gaz.

## Livré
- Landing responsive : accueil, comprendre, FAQ, contact, mentions légales, confidentialité, cookies.
- Lydie sur `/chat`, reliée à `POST /api/lydie` avec moteur conversationnel serveur directif.
- Espace client `/espace-client` : dossiers, détail, documents et conversation.
- Espace conseiller `/conseiller` protégé par les contrôles staff de l'API.
- API dossiers, demandes, documents, messages, timeline, statuts, notes et contact.
- Prisma + PostgreSQL/Supabase, Supabase Auth et Storage.
- PWA/manifest.
- Aucun délai interne de traitement de 24 h n'est promis.

## Installation
```bash
npm install
cp .env.example .env.local
npx prisma generate
npm run typecheck
npm run lint
npm run build
npm run dev
```
Renseigner les variables Supabase/Postgres dans `.env.local` avant les fonctions authentifiées.

### J20 — état, audit et webhooks
Le projet inclut désormais un moteur d'état centralisé avec verrouillage optimiste, audit append-only et idempotence des événements externes. Le webhook Enedis exige `ENEDIS_WEBHOOK_SECRET` et une signature HMAC-SHA256 dans `x-enedis-signature`.
