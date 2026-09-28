/**
 * Validation ET découpage stricts d'une adresse saisie librement dans le
 * chat Lydie, en ses 4 composants distincts et obligatoires : numéro, voie,
 * code postal, ville.
 *
 * Avant cette version, la validation était heuristique ("un chiffre ET
 * (un mot-type rue OU un indice de ville)") — un texte comme "12 Paris",
 * sans aucune voie, pouvait passer. Une adresse comme "42 rue Voltaire",
 * sans code postal ni ville, doit être refusée comme incomplète : c'est
 * exactement le cas que l'ancienne heuristique ne couvrait pas.
 *
 * Ce n'est PAS un géocodage réel : aucune vérification que l'adresse existe
 * vraiment (ça demanderait un vrai appel à l'API adresse.data.gouv.fr /
 * BAN, non fait ici — voir schema.prisma). Ça garantit seulement que le
 * texte contient les 4 composants dans un format reconnaissable. On ne
 * fabrique jamais un composant manquant : si un seul manque, la fonction
 * renvoie null plutôt qu'une valeur devinée.
 */
export type ParsedAddress = {
  numero: string;
  rue: string;
  codePostal: string;
  ville: string;
};

// numéro (+ bis/ter éventuel) — voie (tout sauf chiffres/virgule) — puis
// SOIT ", ville CP" (virgule OBLIGATOIRE avant la ville quand elle précède
// le code postal — ex. "42 rue Voltaire, Onnaing 59300"), SOIT "[,] CP
// ville" (virgule facultative, ordre historique — ex. "42 rue Voltaire,
// 59300 Onnaing" ou "42 rue Voltaire 59300 Onnaing").
//
// La virgule est rendue obligatoire dans le premier cas précisément pour
// éviter l'ambiguïté voie/ville : sans elle, un texte à 3 composants réels
// seulement (ex. "42 rue Voltaire 59300", sans aucune ville) pourrait être
// scindé à tort en faisant passer la fin de la voie pour une ville — vérifié
// par test avant ce correctif (voir lydie-address.test.ts, cas "pas de
// ville du tout"). Aucun des 3 formats demandés n'omet cette virgule quand
// la ville précède le code postal, donc cette exigence ne retire aucun cas
// utile.
const ADDRESS_PATTERN =
  /^(\d+\s*(?:bis|ter)?)\s+([^\d,]+?)\s*(?:,\s*([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*?)\s+(\d{5})|,?\s*(\d{5})\s+([A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ'’\- ]*))$/i;

export function parseAddressStrict(raw: string): ParsedAddress | null {
  const normalized = raw.trim().replace(/\s+/g, " ");
  const match = normalized.match(ADDRESS_PATTERN);
  if (!match) return null;
  // Deux alternatives mutuellement exclusives dans le pattern : soit
  // (villeAvantCp, cpAvantVille) sont renseignés, soit (cpApresVille,
  // villeApresCp) le sont — jamais les deux à la fois, jamais aucun.
  const [, numero, rue, villeAvantCp, cpApresVille1, cpAvantVille, villeApresCp] = match;
  const codePostal = cpAvantVille ?? cpApresVille1;
  const ville = villeAvantCp ?? villeApresCp;
  if (!numero || !rue || !codePostal || !ville) return null;
  const trimmedRue = rue.trim();
  const trimmedVille = ville.trim();
  if (!trimmedRue || !trimmedVille) return null;
  return { numero: numero.trim(), rue: trimmedRue, codePostal, ville: trimmedVille };
}

/** true seulement si les 4 composants (numéro, voie, code postal, ville) sont présents. */
export function isCompleteAddress(raw: string): boolean {
  return parseAddressStrict(raw) !== null;
}
