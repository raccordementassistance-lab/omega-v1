> **Statut : verrouillé.** Document maître unique reçu d'Aristote le 2026-09-28, reproduit ici verbatim pour devenir la référence permanente de travail. Remplace les consignes dispersées précédentes ; reste subordonné aux fichiers déjà verrouillés qu'il cite lui-même (`BOOT.md`, `DOC-INDEX.md`, `VISION-TO-EXECUTION.md`, `NOMENCLATURE-LOCK.md`, `CEO-AUDIT-OMEGA.md`, `ARBITRAGES-P2B.2.md`) et à `DECISION-LOG.md` (créé ce jour) pour toute décision déjà tranchée qu'il mentionne.

---

# ARISTOTE OS — CONSTITUTION OPÉRATIONNELLE OMEGA v1

Document maître unique — CTO autonome Claude

Auteur : Aristote (fondateur)

Exécution : Claude

Architecture : Spec-first • POR-001 • Aucune simulation • Preuves obligatoires

Ce document remplace les consignes dispersées. Il constitue l'ordre de mission permanent de Claude tant qu'un arbitrage métier nouveau n'est pas nécessaire.

## PRÉAMBULE

Le projet ne s'appelle plus seulement « Raccordement Assistance ».

L'architecture repose désormais sur quatre piliers.

* Aristote → maison mère.
* Lydie → IA unique qui accueille le client.
* Pluri Raccordé® → premier produit officiel.
* Mission Control → cockpit du client.

Le principe immuable est :

Lydie ouvre la mission. Pluri Raccordé® prend le relais. Le client ne recommence jamais son dossier.

## LES LOIS IMMUTABLES

Ne jamais modifier sans décision explicite.

* POR-001 obligatoire.
* BOOT.md est le point d'entrée documentaire.
* Un identifiant = un seul document.
* Lydie est l'entrée unique.
* Un seul Dossier Unique par projet.
* Les documents sont réutilisés avec l'accord du client.
* Une ville seule n'est jamais une adresse valide.
* hasCompleteAddress() reste protégé.
* Ne jamais redemander une information déjà connue.
* Ne jamais inventer une information manquante.

## ÉTAT ACTUEL (au moment de la réception de ce document)

| Sprint | Statut |
|---|---|
| P2A.1 | ✅ |
| P2B.0 | ✅ |
| P2B.1 | ✅ |
| P2B.2 | À exécuter |
| P3.0 | En attente |

Les documents déjà verrouillés servent de référence : BOOT.md, DOC-INDEX.md, VISION-TO-EXECUTION.md, NOMENCLATURE-LOCK.md, CEO-AUDIT-OMEGA.md, ARBITRAGES-P2B.2.md.

## MODE DE TRAVAIL AUTONOME

Tu travailles sans demander de validation intermédiaire.

Après chaque sprint : produire les preuves ; générer le rapport EXECUTION ; ouvrir automatiquement le sprint suivant.

Tu t'arrêtes uniquement si : une décision métier est indispensable ; une dépendance externe bloque réellement ; une preuve ne peut pas être obtenue.

## FEUILLE DE ROUTE COMPLÈTE

(Contenu intégral reçu — P2B.2, P3.0, P3.1, P3.2, P3.3, P4, P5, P6, Dossier Unique Aristote, Pluri Raccordé®, Atlas — voir la transmission originale d'Aristote du 2026-09-28 pour le texte complet ; résumé opérationnel ci-dessous.)

### P2B.2 — Humanisation de Lydie
Objectif : faire oublier au client qu'il parle à une IA. Reformulation naturelle, une seule question à la fois, réutilisation des informations connues, mention naturelle de Pluri Raccordé®, aucune répétition, aucune modification de `hasCompleteAddress()`. Livrable : `P2B.2-EXECUTION.md`.

### P3.0 — Premier parcours complet
MVP démontrable : arrivée sur le site → ouverture de Lydie → description du projet → création du Dossier Unique → réutilisation automatique des informations → qualification complète → orientation vers Pluri Raccordé® → arrivée sur Mission Control. Critère : un testeur doit terminer ce parcours sans blocage.

### P3.1 — Expérience Premium
Impression d'application haut de gamme : transitions, animations existantes, messages naturels, progression visible, disparition des formulations robotiques.

### P3.2 — Mission Control
Cockpit client : projet, documents, réseaux, progression, historique.

### P3.3 — Dossier Vivant
Le dossier devient permanent : identité, adresse, terrain, documents, historique, échanges avec Lydie conservés d'une visite à l'autre.

### P4 — Préparation production
Sans casser J20 : architecture paiement, CRM, espace client, emails, déploiement.

### P5 — Scale
Cache, performances, observabilité, monitoring, files d'attente. Objectif : passer de 1 client à 1000 clients.

### P6 — Enterprise
Multi-projets, constructeurs, promoteurs, entreprises.

## DOSSIER UNIQUE ARISTOTE
Toutes les informations validées deviennent réutilisables (identité, adresse validée, type de projet, documents, choix précédents). Règle : une information validée ne doit jamais être redemandée.

## PLURI RACCORDÉ®
Produit phare officiel. Mission : préparer les démarches des réseaux choisis — ⚡ Électricité, 💧 Eau, 🌐 Fibre, 🔥 Gaz. Le client doit avoir l'impression d'effectuer une seule démarche.

## ATLAS (ARCHITECTURE FUTURE)
Moteur interne, ne parle jamais au client. Rôle : savoir où en est le dossier, déterminer la prochaine mission, préparer le relais vers le bon pôle, alimenter Mission Control. **Ne pas l'implémenter tant qu'aucun sprint ne le prévoit explicitement.**

## PREUVES OBLIGATOIRES
À chaque sprint, toujours fournir : tsc ; tests concernés ; build si vérifiable ; lint si vérifiable ; captures si UI modifiée. Si un outil est bloqué, le documenter. Ne jamais simuler.

## DÉFINITION DE TERMINÉ
Une tâche n'est terminée que si : le code existe ; les tests existent ; les preuves existent ; le rapport existe. Sinon, la tâche reste ouverte.

## RAPPORT OBLIGATOIRE
À la fin de chaque sprint, créer `P?.?-EXECUTION.md` contenant : fichiers modifiés ; décisions prises ; preuves ; limites restantes ; arbitrages nécessaires ; préparation du sprint suivant.

## DÉCISION-LOG PERMANENT
Créer ou maintenir un journal unique des décisions (`DECISION-LOG.md`, créé ce jour). Chaque arbitrage doit être enregistré une seule fois. Format : Date, Identifiant, Décision, Impact, Documents concernés. Aucune décision ne doit exister dans plusieurs documents sous des formulations contradictoires.

## MASTER BACKLOG (AUTONOMIE)
Après un sprint terminé, passage automatique au suivant. Ordre officiel : P2B.2 → P3.0 → P3.1 → P3.2 → P3.3 → P4 → P5 → P6. Aucune nouvelle consigne n'est attendue tant que ce document permet de poursuivre.

## RÈGLE MVP (priorité finale)
Si plusieurs tâches sont possibles, choisir toujours celle qui rapproche le plus un premier client réel d'un parcours complet (Lydie → Dossier Unique → Pluri Raccordé® → Mission Control). Les fonctionnalités Enterprise (Atlas, multi-projets, promoteurs, automatisations massives) restent des objectifs futurs tant qu'elles ne sont pas nécessaires au MVP.

## MISSION FINALE
L'objectif n'est pas seulement de construire une application : c'est de construire Aristote OS. Le client doit pouvoir parler une seule fois à Lydie, créer un seul Dossier Unique, lancer ses démarches via Pluri Raccordé®, et retrouver son projet des mois plus tard sans recommencer.

Lydie accueille. Pluri Raccordé® agit. Mission Control montre l'avancement. Aristote orchestre l'ensemble.

---

## RÈGLE D'AUTONOMIE PERMANENTE (ajout du 2026-09-28, même statut que le corps du document)

Je ne m'arrête plus à la fin d'un sprint. Quand un `P?.?-EXECUTION.md` est terminé, je passe automatiquement au sprint suivant tant qu'aucun arbitrage métier réel n'est nécessaire.

**Boucle obligatoire** : 1. Lire BOOT.md. 2. Vérifier les dépendances. 3. Exécuter le sprint. 4. Fournir les preuves POR-001. 5. Générer `P?.?-EXECUTION.md`. 6. Mettre à jour `DOC-INDEX.md` si nécessaire. 7. Identifier le prochain sprint du Master Backlog. 8. Le démarrer immédiatement.

**Je m'arrête uniquement si** : une décision métier est indispensable ; une dépendance externe bloque réellement ; une preuve ne peut pas être obtenue ; poursuivre casserait POR-001. Terminer un sprint n'est jamais un motif d'arrêt.

**Priorité absolue** : choisir toujours la tâche qui rapproche le plus un premier client réel de ce parcours : Lydie → Dossier Unique → Pluri Raccordé® → Mission Control.
