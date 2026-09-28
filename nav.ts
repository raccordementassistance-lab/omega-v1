export interface NavLink {
  href: string;
  label: string;
}

/** Liens principaux, affichés dans le header (desktop et mobile). */
export const mainNav: NavLink[] = [
  { href: "/comprendre", label: "Comment ça marche" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** Liens légaux, affichés uniquement dans le footer. */
export const legalNav: NavLink[] = [
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/confidentialite", label: "Politique de confidentialité" },
  { href: "/cookies", label: "Gestion des cookies" },
];
