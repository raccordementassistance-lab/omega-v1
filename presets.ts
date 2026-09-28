/**
 * Constantes de présentation, purement front-end, pour l'écran d'entrée et
 * les réponses rapides de la conversation Lydie.
 *
 * IMPORTANT : ce fichier ne contient AUCUNE logique métier. Chaque « carte de
 * projet » se limite à préremplir le champ de saisie avec une phrase en
 * langage naturel, envoyée exactement comme si le client l'avait tapée
 * lui-même — via le même `send()` / la même route `/api/lydie` que le fil de
 * conversation. La détection du type de projet reste entièrement assurée par
 * `detectProject()` dans src/lib/lydie/engine.ts (fichier non modifié par
 * cette passe UI).
 *
 * Les phrases ci-dessous ont été choisies pour matcher sans ambiguïté un
 * seul motif de `detectProject()` (vérifié par lecture de engine.ts) :
 *  - "maison neuve"                → MAISON_NEUVE
 *  - "provisoire"                  → RACCORDEMENT_PROVISOIRE
 *  - "borne" / "recharge"          → NOUVEAU_RACCORDEMENT
 *  - "Modification / déplacement"  → aucune phrase fournie : ce bouton
 *    engloberait deux types J20 distincts (MODIFICATION_BRANCHEMENT et
 *    DEPLACEMENT_COMPTEUR) qu'aucune formulation ne peut désigner sans en
 *    deviner un au hasard. Le message envoyé reste donc volontairement
 *    neutre (aucun mot-clé de `detectProject()`), ce qui laisse Lydie poser
 *    sa question normale de l'étape PROJECT plutôt que de choisir à la place
 *    du client — voir le rapport final, section « signalement ».
 */

import type { LydieProjectType } from "@/lib/lydie/engine";

export type LydieProjectCardId =
  | "MAISON_NEUVE"
  | "RACCORDEMENT_PROVISOIRE"
  | "BORNE_RECHARGE"
  | "MODIFICATION_OU_DEPLACEMENT";

export interface LydieProjectCard {
  id: LydieProjectCardId;
  label: string;
  message: string;
}

export const LYDIE_PROJECT_CARDS: LydieProjectCard[] = [
  {
    id: "MAISON_NEUVE",
    label: "Maison neuve",
    message: "Bonjour, je construis une maison neuve et je souhaite un raccordement électrique.",
  },
  {
    id: "RACCORDEMENT_PROVISOIRE",
    label: "Raccordement provisoire",
    message: "Bonjour, j'ai besoin d'un raccordement provisoire pour un chantier.",
  },
  {
    id: "BORNE_RECHARGE",
    label: "Borne de recharge",
    message: "Bonjour, je souhaite installer une borne de recharge pour véhicule électrique.",
  },
  {
    id: "MODIFICATION_OU_DEPLACEMENT",
    label: "Modification / déplacement",
    // Volontairement sans mot-clé détecté par detectProject() : voir le
    // commentaire de tête de fichier. Lydie posera sa question habituelle
    // pour laisser le client préciser lui-même lequel des deux cas s'applique.
    message: "Bonjour, mon installation électrique existe déjà et j'aimerais qu'elle évolue, mais je ne sais pas encore préciser en quoi exactement.",
  },
];

export const LYDIE_DONT_KNOW_MESSAGE =
  "Bonjour, je ne sais pas exactement quel type de projet correspond à ma demande, pouvez-vous m'aider ?";

/**
 * Libellés d'affichage pour `LydieProjectType` (src/lib/lydie/engine.ts).
 * Dupliqué volontairement ici, à l'identique de `PROJECT_LABELS` (non
 * exporté par engine.ts) — même principe de duplication assumée que
 * `ADDRESS_PATTERN` entre engine.ts et parseAddress.ts : DOIT rester aligné
 * si `LydieProjectType` change. N'affecte que l'affichage du récapitulatif
 * dans le panneau "Votre demande", jamais une décision métier.
 */
export const LYDIE_PROJECT_TYPE_LABELS: Record<LydieProjectType, string> = {
  MAISON_NEUVE: "Maison neuve",
  LOCAL_PROFESSIONNEL: "Local professionnel",
  MODIFICATION_BRANCHEMENT: "Modification de branchement",
  DEPLACEMENT_COMPTEUR: "Déplacement de compteur",
  RACCORDEMENT_PROVISOIRE: "Raccordement provisoire",
  NOUVEAU_RACCORDEMENT: "Nouveau raccordement (borne de recharge, etc.)",
};
