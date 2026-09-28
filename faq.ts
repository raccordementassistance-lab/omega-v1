export interface FaqItem {
  question: string;
  answer: string;
}

export interface FaqCategory {
  id: string;
  title: string;
  items: FaqItem[];
}

/**
 * Contenu FAQ. Règle impérative : ne jamais inventer de délai, de prix ou de
 * décision Enedis. Chaque réponse renvoie vers Enedis ou vers le dossier du
 * client pour toute information chiffrée ou décisionnelle qui ne nous
 * appartient pas.
 */
export const faqCategories: FaqCategory[] = [
  {
    id: "raccordement",
    title: "Le raccordement électrique",
    items: [
      {
        question: "Qu'est-ce qu'une demande de raccordement électrique ?",
        answer:
          "C'est la démarche administrative et technique nécessaire pour obtenir, modifier ou augmenter une alimentation électrique sur un site (construction neuve, rénovation, augmentation de puissance, etc.). Elle est instruite par le gestionnaire du réseau de distribution, Enedis dans la grande majorité des cas en France.",
      },
      {
        question: "Dans quels cas ai-je besoin de faire cette démarche ?",
        answer:
          "Principalement pour une construction neuve, une extension de logement, une augmentation de puissance électrique, ou le raccordement d'une installation spécifique (borne de recharge, panneaux solaires, etc.). Lydie vous aide à identifier précisément votre situation dès le début de l'échange.",
      },
    ],
  },
  {
    id: "role-raccordement-assistance",
    title: "Le rôle de Raccordement Assistance",
    items: [
      {
        question: "Que fait Raccordement Assistance concrètement ?",
        answer:
          "Nous vous accompagnons pour préparer votre dossier de raccordement : nous vous aidons à identifier les bonnes informations, à rassembler les documents nécessaires, et nous déposons la demande auprès d'Enedis en votre nom, avec votre autorisation explicite.",
      },
      {
        question: "Raccordement Assistance est-il Enedis ?",
        answer:
          "Non. Raccordement Assistance est un service indépendant d'accompagnement. Nous ne sommes ni Enedis, ni un de ses représentants officiels. Nous préparons et transmettons votre dossier ; seul Enedis instruit et réalise le raccordement.",
      },
    ],
  },
  {
    id: "role-enedis",
    title: "Le rôle d'Enedis",
    items: [
      {
        question: "Que fait Enedis dans le processus ?",
        answer:
          "Enedis est le gestionnaire du réseau de distribution électrique. C'est Enedis qui instruit officiellement votre demande, établit la proposition technique et financière, programme les travaux si nécessaire, et réalise le raccordement physique.",
      },
      {
        question: "Enedis peut-il refuser ou modifier ma demande ?",
        answer:
          "Oui. Enedis reste seul décisionnaire sur la faisabilité technique, les délais et les conditions de votre raccordement. Nous ne pouvons ni garantir, ni anticiper les décisions d'Enedis : nous vous relayons les informations officielles dès qu'Enedis nous les communique.",
      },
    ],
  },
  {
    id: "documents",
    title: "Les documents à fournir",
    items: [
      {
        question: "Quels documents dois-je préparer ?",
        answer:
          "Les documents nécessaires dépendent de votre situation (type de projet, type de logement, puissance demandée, etc.). Lydie vous indique précisément, au fil de l'échange, la liste des pièces à fournir pour votre dossier.",
      },
      {
        question: "Comment transmettre mes documents ?",
        answer:
          "Une fois votre dossier initié, vous pourrez déposer vos documents directement depuis votre espace personnel sécurisé. Vous voyez à tout moment ce qui a été reçu et ce qu'il reste à transmettre.",
      },
    ],
  },
  {
    id: "delais",
    title: "Les délais",
    items: [
      {
        question: "Combien de temps dure une demande de raccordement ?",
        answer:
          "Les délais dépendent uniquement d'Enedis et varient selon la nature du projet, la région et la charge du réseau au moment de la demande. Nous ne communiquons jamais de délai estimé de notre propre initiative : dès qu'Enedis vous transmet un délai officiel, il apparaît dans le suivi de votre dossier.",
      },
    ],
  },
  {
    id: "prix",
    title: "Le prix",
    items: [
      {
        question: "Combien coûte l'accompagnement Raccordement Assistance ?",
        answer:
          "L'accompagnement par Raccordement Assistance est actuellement gratuit. Cette information est susceptible d'évoluer ; la condition en vigueur au moment de votre démarche vous sera clairement indiquée.",
      },
      {
        question: "Combien coûte le raccordement lui-même ?",
        answer:
          "Le coût du raccordement (branchement, extension de réseau, éventuels travaux) est fixé par Enedis dans sa proposition technique et financière, propre à chaque dossier. Nous ne fixons ni n'estimons ce tarif : il vous est communiqué officiellement par Enedis.",
      },
    ],
  },
  {
    id: "suivi",
    title: "Le suivi de mon dossier",
    items: [
      {
        question: "Comment savoir où en est ma demande ?",
        answer:
          "Votre espace personnel affiche l'avancement de votre dossier : les informations transmises, les documents reçus, et les étapes en attente. Vous êtes informé dès qu'une mise à jour importante intervient.",
      },
      {
        question: "Puis-je contacter quelqu'un si j'ai une question sur mon dossier ?",
        answer:
          "Oui, vous pouvez nous contacter via la page Contact ou reprendre l'échange avec Lydie à tout moment pour toute question concernant votre dossier.",
      },
    ],
  },
  {
    id: "depot",
    title: "Le dépôt de la demande",
    items: [
      {
        question: "Qui dépose réellement la demande auprès d'Enedis ?",
        answer:
          "C'est Raccordement Assistance qui transmet votre dossier à Enedis, mais uniquement après que vous avez vérifié les informations et donné votre autorisation explicite. Rien n'est déposé en votre nom sans votre accord.",
      },
      {
        question: "Puis-je vérifier mon dossier avant qu'il ne soit déposé ?",
        answer:
          "Oui, c'est une étape obligatoire du parcours : vous consultez l'ensemble des informations et documents avant de donner votre autorisation de dépôt.",
      },
    ],
  },
  {
    id: "confidentialite",
    title: "La confidentialité",
    items: [
      {
        question: "Mes informations personnelles sont-elles protégées ?",
        answer:
          "Oui. Vos informations et documents sont traités de manière confidentielle et ne sont utilisés que pour la préparation et le suivi de votre dossier de raccordement. Le détail des traitements est décrit dans notre politique de confidentialité.",
      },
      {
        question: "Mes documents sont-ils partagés avec d'autres organismes ?",
        answer:
          "Vos documents ne sont transmis qu'à Enedis, dans le cadre strict de votre demande de raccordement, et le cas échéant aux prestataires techniques strictement nécessaires au traitement de votre dossier.",
      },
    ],
  },
];
