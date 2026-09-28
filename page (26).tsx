import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/PageHero";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
};

/**
 * Décrit uniquement les traitements réellement prévus par l'architecture
 * du projet (voir docs/architecture.md et .env.example) : Supabase Auth /
 * Storage, Postgres via Prisma, Resend pour les e-mails transactionnels.
 * Aucun service ou traitement non confirmé n'est mentionné.
 */
export default function ConfidentialitePage() {
  return (
    <>
      <PageHero eyebrow="Vos données" title="Politique de confidentialité" />

      <Section bare>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="prose-legal">
            <p>
              Cette politique explique quelles informations Raccordement Assistance collecte
              lorsque vous utilisez le site, pourquoi, et comment elles sont protégées.
            </p>

            <h2>Responsable du traitement</h2>
            <p>
              Le responsable du traitement est [Raison sociale à compléter], éditeur du site
              (voir <Link href="/mentions-legales">mentions légales</Link>).
            </p>

            <h2>Données collectées</h2>
            <ul>
              <li>
                Les informations que vous transmettez à Lydie pour préparer votre dossier de
                raccordement (identité, adresse du site à raccorder, nature du projet).
              </li>
              <li>
                Les documents que vous déposez dans votre espace personnel pour constituer votre
                dossier.
              </li>
              <li>Les informations transmises via le formulaire de contact (nom, e-mail, message).</li>
              <li>
                Les informations techniques nécessaires à l&apos;authentification et à la
                sécurité de votre espace (session de connexion).
              </li>
            </ul>

            <h2>Finalités du traitement</h2>
            <ul>
              <li>Préparer, compléter et transmettre votre demande de raccordement à Enedis.</li>
              <li>Assurer le suivi de votre dossier et vous informer de son avancement.</li>
              <li>Répondre à vos demandes de contact.</li>
              <li>Sécuriser l&apos;accès à votre espace personnel.</li>
            </ul>

            <h2>Hébergement et sous-traitants</h2>
            <p>
              Vos données sont hébergées et sécurisées via Supabase (base de données et
              stockage de documents). Les e-mails transactionnels (confirmations, notifications
              de suivi) sont envoyés via un prestataire d&apos;envoi d&apos;e-mails. Aucun autre
              service tiers n&apos;a accès à vos données personnelles.
            </p>

            <h2>Partage avec Enedis</h2>
            <p>
              Une fois votre dossier complet et votre autorisation explicite donnée, les
              informations et documents strictement nécessaires à votre demande sont transmis à
              Enedis, seul gestionnaire compétent pour l&apos;instruire.
            </p>

            <h2>Durée de conservation</h2>
            <p>
              Vos données sont conservées le temps nécessaire au traitement de votre dossier,
              puis archivées ou supprimées conformément aux obligations légales applicables.
            </p>

            <h2>Vos droits</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD), vous
              disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
              limitation et d&apos;opposition concernant vos données personnelles. Vous pouvez
              exercer ces droits en nous contactant via notre{" "}
              <Link href="/contact">page de contact</Link>.
            </p>

            <h2>Cookies</h2>
            <p>
              Le site utilise des cookies strictement nécessaires à son fonctionnement. Le
              détail est disponible sur notre page{" "}
              <Link href="/cookies">Gestion des cookies</Link>.
            </p>

            <h2>Sécurité</h2>
            <p>
              L&apos;accès à vos données est protégé par une authentification sécurisée et des
              règles de contrôle d&apos;accès appliquées au niveau de la base de données, afin
              qu&apos;aucun autre utilisateur ne puisse consulter votre dossier.
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
