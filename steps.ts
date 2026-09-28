export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

/**
 * Les 5 étapes du parcours, telles que définies dans le cahier des charges.
 * Contenu partagé entre la page d'accueil (aperçu) et /comprendre (détail).
 * Ne jamais ajouter de délai chiffré ou de promesse non confirmée ici.
 */
export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: "Vous présentez votre projet",
    description:
      "Vous expliquez à Lydie votre projet de raccordement électrique : type de logement, travaux prévus, situation actuelle. Aucune connaissance technique n'est nécessaire.",
  },
  {
    number: 2,
    title: "Lydie prépare votre dossier",
    description:
      "À partir de vos réponses, Lydie identifie les informations et les pièces nécessaires à votre demande et constitue votre dossier étape par étape.",
  },
  {
    number: 3,
    title: "Vous transmettez vos documents",
    description:
      "Vous déposez vos documents directement depuis votre espace, en toute sécurité. Vous pouvez suivre à tout moment ce qui a été reçu et ce qu'il reste à fournir.",
  },
  {
    number: 4,
    title: "Vous nous autorisez à déposer votre demande",
    description:
      "Une fois votre dossier complet, vous vérifiez les informations et nous donnez votre accord explicite pour le déposer en votre nom.",
  },
  {
    number: 5,
    title: "Enedis prend ensuite le relais",
    description:
      "Votre demande est transmise à Enedis, seul gestionnaire du réseau de distribution électrique compétent pour l'instruire, la programmer et réaliser le raccordement.",
  },
];
