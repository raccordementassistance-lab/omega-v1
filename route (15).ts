import { NextResponse } from "next/server";
import { z } from "zod";
import {
  stepLydie,
  isSkip,
  isValidEmail,
  INITIAL_LYDIE_CONTEXT,
  type LydieContext,
} from "@/lib/lydie/engine";
import { parseAddressStrict } from "@/lib/lydie/parseAddress";
import { buildDemandeDescription, buildMandatDocumentData, deriveLydieContextFromDossier } from "@/lib/lydie/resume";
import { getCurrentUser } from "@/lib/auth/session";
import { assertCanAccessDossier } from "@/lib/auth/roles";
import { dossierRepository } from "@/lib/repositories/dossier.repository";
import { transitionDossierInTransaction } from "@/state-machine/state-machine-engine";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

const lydieProjectType = z.enum([
  "MAISON_NEUVE",
  "LOCAL_PROFESSIONNEL",
  "MODIFICATION_BRANCHEMENT",
  "DEPLACEMENT_COMPTEUR",
  "RACCORDEMENT_PROVISOIRE",
  "NOUVEAU_RACCORDEMENT",
]);

// Hotfix build Vercel (post-Gold Master) : `z.ZodType<LydieContext>` seul
// vérifie à la fois l'Output ET l'Input du schéma contre `LydieContext`. Or
// le champ `addressDraft` ci-dessous porte un `.optional()` avant son
// `.transform()` (pour accepter un ancien client qui n'envoie pas encore ce
// champ, voir commentaire plus bas) — son Input réel est donc `string |
// null | undefined`, alors que `LydieContext.addressDraft` (utilisé aussi
// comme type d'Input par défaut) est `string | null`, sans `undefined`.
// Cette divergence Input, invisible dans ce sandbox (aucun `zod` réel
// installable ici, cf. KNOWN-LIMITATIONS.md), fait échouer la vérification
// de types au build sur Vercel. Correction minimale : figer l'Input du
// schéma à `unknown` (ce qui correspond à l'usage réel — `.parse()` reçoit
// le JSON brut de la requête, jamais un `LydieContext` déjà typé) pour ne
// contraindre que l'Output, sans toucher à un seul champ ni à leur logique.
const lydieContextSchema: z.ZodType<LydieContext, z.ZodTypeDef, unknown> = z.object({
  step: z.enum(["MODE", "PROJECT", "ADDRESS", "DETAILS", "DOCUMENTS", "EMAIL", "SUMMARY", "MANDAT", "DONE"]),
  mode: z.enum(["TEXT", "VOICE_UNAVAILABLE"]).nullable(),
  project: lydieProjectType.nullable(),
  address: z.string().max(500).nullable(),
  // .optional() : un client déjà ouvert avant ce correctif envoie encore un
  // contexte sans ce champ — jamais rejeté pour autant. .transform ramène
  // l'absence à `null`, exactement la valeur neutre attendue par
  // `LydieContext` (aucun fragment en attente), jamais deviné autrement.
  addressDraft: z
    .string()
    .max(500)
    .nullable()
    .optional()
    .transform((v) => v ?? null),
  details: z.string().max(2000).nullable(),
  documents: z.string().max(2000).nullable(),
  email: z.string().max(320).nullable(),
  mandatRepresentation: z.boolean(),
  mandatTransmission: z.boolean(),
  mandatConfirmation: z.boolean(),
  confirmed: z.boolean(),
  dossierId: z.string().uuid().nullable(),
  confirmationKey: z.string().max(200).nullable(),
});

const schema = z.object({
  dossierId: z.string().uuid().optional(),
  message: z.string().trim().min(1).max(4000),
  context: lydieContextSchema.optional(),
  // Conservé uniquement pour ne pas casser un éventuel appelant non migré :
  // n'est plus utilisé pour reconstruire le parcours (voir resume.ts).
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(4000) })).max(30).optional(),
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());

    // Conversation déjà rattachée à un dossier existant : on vérifie les
    // droits d'accès avant toute chose, comme avant.
    let ownershipDossierId: string | null = null;
    if (body.dossierId) {
      const user = await getCurrentUser();
      if (!user) return NextResponse.json({ error: { message: "Vous devez être connecté." } }, { status: 401 });
      const ownership = await dossierRepository.findOwnership(body.dossierId);
      if (!ownership) return NextResponse.json({ error: { message: "Dossier introuvable." } }, { status: 404 });
      assertCanAccessDossier(user, ownership.clientId);
      ownershipDossierId = ownership.id;
    }

    // Le contexte vient normalement du client (page /chat). S'il est absent
    // alors qu'un dossier est indiqué — cas du widget "Parler à Lydie" de la
    // page dossier, qui ne porte aucun contexte côté client, ou un client qui
    // revient sur un autre appareil — on le reconstruit depuis les données
    // structurées réellement en base plutôt que de tout redemander.
    let startingContext: LydieContext;
    if (body.context) {
      startingContext = body.context;
    } else if (ownershipDossierId) {
      const detail = await dossierRepository.findByIdWithDetails(ownershipDossierId);
      const lastDemande = detail?.demandes?.[detail.demandes.length - 1] ?? null;
      startingContext = deriveLydieContextFromDossier(ownershipDossierId, lastDemande);
    } else {
      // Mission P3.3 (Dossier Vivant) : ni contexte ni dossierId fournis —
      // c'est le tout premier message d'une session de navigateur sans état
      // local (voir chat/page.tsx, qui n'envoie alors volontairement aucun
      // `context`). Si le client est déjà authentifié et possède déjà un
      // dossier, on le reprend au lieu de tout redemander — « le client ne
      // recommence jamais son dossier » (Constitution OMEGA). Lecture
      // Prisma seule (findLatestForClient, ci-dessus), aucune écriture,
      // aucune nouvelle table. Si le client n'est pas authentifié, ou n'a
      // encore aucun dossier, le comportement reste EXACTEMENT le même
      // qu'avant cette mission : INITIAL_LYDIE_CONTEXT.
      const user = await getCurrentUser();
      const existing = user ? await dossierRepository.findLatestForClient(user.id) : null;
      const derived = existing
        ? deriveLydieContextFromDossier(existing.id, existing.demandes[existing.demandes.length - 1] ?? null)
        : null;
      if (derived && derived.step !== "DONE") {
        // Il existe une qualification/un dossier réellement à reprendre
        // (pas encore de Demande, ou une Demande pas encore finalisée) :
        // c'est exactement le cas « conversation interrompue » que ce
        // sprint doit couvrir.
        ownershipDossierId = existing?.id ?? null;
        startingContext = derived;
      } else {
        // Bug trouvé et corrigé pendant l'audit P3.4 : si le dossier le plus
        // récent est déjà TERMINÉ (derived.step === "DONE"), le reprendre
        // automatiquement ici bloquerait tout NOUVEAU projet décrit depuis
        // /chat derrière un message « votre dossier est déjà confirmé »
        // (voir le cas DONE de stepLydie, inchangé) — un parcours cassé pour
        // un client qui revient avec une seconde demande. Contrairement au
        // widget de la page dossier (qui cible explicitement CE dossier-là
        // et doit donc bien afficher ce message), une session /chat sans
        // dossierId connu repart ici d'un contexte neutre, exactement comme
        // avant cette mission.
        startingContext = INITIAL_LYDIE_CONTEXT;
      }
    }

    const result = stepLydie(body.message, startingContext);
    let reply = result.reply;
    let context = result.context;
    if (ownershipDossierId && !context.dossierId) {
      context = { ...context, dossierId: ownershipDossierId };
    }
    let dossierPayload: { id: string; numero: string | null } | null = null;
    let requiresAuth = false;

    if (result.readyToFinalize && !isQualificationReadyForFinalization(context)) {
      // Revalidation indépendante côté serveur : le moteur ne devrait jamais
      // laisser passer readyToFinalize sans e-mail valide ni mandat 3/3,
      // mais le contexte est entièrement porté par le client — on ne fait
      // pas confiance à `readyToFinalize` seul pour écrire en base.
      // (Limite assumée : sans état de session tenu par le serveur, ceci
      // protège contre une écriture invalide, pas contre un client qui
      // fabriquerait une requête prétendant que les 3 conditions ont été
      // acceptées honnêtement — voir le rapport transmis à l'utilisateur.)
      return NextResponse.json(
        { error: { code: "MANDAT_OU_EMAIL_INVALIDE", message: "L'e-mail et les 3 conditions du mandat sont requis avant toute transmission." } },
        { status: 409 }
      );
    }

    if (result.readyToFinalize && !context.dossierId) {
      const user = await getCurrentUser();
      if (!user) {
        requiresAuth = true;
        reply =
          "Merci, j'ai bien votre demande. Pour créer votre dossier, connectez-vous ou créez un compte, puis confirmez à nouveau — rien n'est perdu.";
      } else {
        const confirmationKey = context.confirmationKey ?? crypto.randomUUID();
        const created = await finalizeLydieQualification({ existingDossierId: null, clientId: user.id, context, confirmationKey });
        context = { ...context, dossierId: created.id };
        dossierPayload = { id: created.id, numero: created.numero };
        reply = `Merci, c'est confirmé. Votre dossier ${created.numero ?? ""} a été créé, vous pouvez le suivre depuis votre espace client.`;
      }
    } else if (result.readyToFinalize && context.dossierId) {
      // Reprise sur un dossier déjà existant sans Demande (créé autrement
      // que via Lydie) : on complète ce dossier plutôt que d'en créer un
      // second — jamais deux dossiers pour une seule confirmation.
      const user = await getCurrentUser();
      if (user) {
        const confirmationKey = context.confirmationKey ?? crypto.randomUUID();
        const finalized = await finalizeLydieQualification({ existingDossierId: context.dossierId, clientId: user.id, context, confirmationKey });
        dossierPayload = { id: finalized.id, numero: finalized.numero };
        reply = `Merci, c'est confirmé. Votre dossier ${finalized.numero ?? ""} est à jour, vous pouvez le suivre depuis votre espace client.`;
      }
    }

    const activeDossierId = ownershipDossierId ?? context.dossierId;
    if (activeDossierId) {
      const dossier = await prisma.dossier.findUnique({ where: { id: activeDossierId }, select: { currentStep: true } });
      if (dossier) {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          await tx.message.create({ data: { dossierId: activeDossierId, role: "CLIENT", type: "TEXTE", step: dossier.currentStep, content: body.message } });
          await tx.message.create({ data: { dossierId: activeDossierId, role: "LYDIE", type: "TEXTE", step: dossier.currentStep, content: reply } });
        });
      }
    }

    return NextResponse.json({ reply, context, step: context.step, dossier: dossierPayload, requiresAuth });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Votre message est invalide." : "Impossible de traiter votre message.";
    return NextResponse.json({ error: { code: "VALIDATION_ERROR", message } }, { status: error instanceof z.ZodError ? 400 : 500 });
  }
}

/**
 * Revalidation serveur, indépendante du moteur : l'e-mail doit être présent
 * et syntaxiquement valide, et les 3 conditions du mandat toutes acceptées.
 * Voir la note dans POST() sur la limite assumée de cette protection.
 */
function isQualificationReadyForFinalization(context: LydieContext): boolean {
  return Boolean(
    context.email &&
      isValidEmail(context.email) &&
      context.mandatRepresentation &&
      context.mandatTransmission &&
      context.mandatConfirmation
  );
}

/**
 * Détecte une violation de contrainte unique Prisma (code "P2002") sans
 * dépendre du type runtime exact exporté par @prisma/client — juste de la
 * forme réelle de l'erreur (une propriété `code`), pour rester robuste même
 * si les types générés changent de forme d'une version à l'autre.
 */
function isUniqueConstraintViolation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === "P2002";
}

/**
 * Finalise la qualification Lydie de façon atomique et idempotente :
 *
 *  - existingDossierId === null → tente de créer le Dossier avec sa clé de
 *    confirmation. La contrainte UNIQUE en base sur `lydieConfirmationKey`
 *    (migration 20260926010000_lydie_confirmation_key) garantit que si deux
 *    requêtes concurrentes portent la même clé, une seule création réussit ;
 *    l'autre reçoit une violation de contrainte (P2002), qu'on traite en
 *    récupérant le dossier déjà créé plutôt qu'en échouant.
 *  - existingDossierId fourni → "réclame" ce dossier avec la clé via un
 *    UPDATE conditionnel (`WHERE lydieConfirmationKey IS NULL`), sur le
 *    même principe que les transitions J20 (updateMany + vérification du
 *    nombre de lignes touchées). Seule la requête qui gagne la réclamation
 *    crée la Demande/Adresse et transitionne le dossier.
 *
 * Dans tous les cas, au plus une Demande est créée et au plus une paire de
 * transitions J20 est appliquée pour une confirmation donnée, même sous
 * concurrence réelle — la protection est en base, pas seulement dans ce
 * code applicatif.
 */
async function finalizeLydieQualification(params: {
  existingDossierId: string | null;
  clientId: string;
  context: LydieContext;
  confirmationKey: string;
}) {
  const { existingDossierId, clientId, context, confirmationKey } = params;

  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    let dossierId: string;
    let won: boolean;

    if (!existingDossierId) {
      try {
        const dossier = await tx.dossier.create({ data: { clientId, lydieConfirmationKey: confirmationKey } });
        dossierId = dossier.id;
        won = true;
      } catch (error) {
        if (isUniqueConstraintViolation(error)) {
          // Une requête concurrente avec la même clé a déjà créé le dossier :
          // on ne duplique rien, on renvoie ce dossier existant.
          const existing = await tx.dossier.findUniqueOrThrow({ where: { lydieConfirmationKey: confirmationKey } });
          dossierId = existing.id;
          won = false;
        } else {
          throw error;
        }
      }

      if (won) {
        await tx.timelineEvent.create({
          data: { dossierId, label: "Dossier créé via Lydie", newStatus: "NOUVEAU", authorType: "CLIENT", authorId: clientId },
        });
        await tx.dossierStatusHistory.create({
          data: { dossierId, newStatus: "NOUVEAU", authorType: "CLIENT", authorId: clientId },
        });
      }
    } else {
      dossierId = existingDossierId;
      const claim = await tx.dossier.updateMany({
        where: { id: dossierId, lydieConfirmationKey: null },
        data: { lydieConfirmationKey: confirmationKey },
      });
      won = claim.count === 1;
    }

    if (won && context.project) {
      let adresseId: string | undefined;
      if (context.address) {
        const parsed = parseAddressStrict(context.address);
        if (!parsed) {
          // Ne devrait jamais arriver : l'étape ADDRESS du moteur exige déjà
          // les 4 composants avant d'avancer. Défensif plutôt que silencieux
          // — on ne fabrique jamais une adresse à partir d'un texte incomplet.
          throw new Error("Adresse incomplète : impossible de finaliser sans les 4 composants (numéro, voie, code postal, ville).");
        }
        const adresse = await tx.adresse.create({
          data: { numero: parsed.numero, rue: parsed.rue, codePostal: parsed.codePostal, ville: parsed.ville },
        });
        adresseId = adresse.id;
      }
      const demande = await tx.demande.create({
        data: {
          dossierId,
          type: context.project,
          description: buildDemandeDescription(
            context.details && !isSkip(context.details) ? context.details : null,
            context.documents && !isSkip(context.documents) ? context.documents : null
          ),
          email: context.email,
          mandatRepresentation: context.mandatRepresentation,
          mandatTransmission: context.mandatTransmission,
          mandatConfirmation: context.mandatConfirmation,
          mandatAcceptedAt: new Date(),
          adresseId,
        },
      });

      // Matérialisation automatique du mandat : le document MANDAT_SIGNE
      // n'est jamais fourni par le client — il représente les 3 consentements
      // qui viennent d'être enregistrés ci-dessus, jamais l'inverse. Décision
      // et contenu du document délégués à buildMandatDocumentData() (pure,
      // testée seule dans src/tests/unit/lydie-mandat-materialization.test.ts) ;
      // créé dans la même transaction que la Demande, donc protégé par la
      // même idempotence que le reste de ce bloc (`if (won && ...)` : au
      // plus une fois par confirmation réelle — aucune contrainte Prisma
      // supplémentaire n'est nécessaire pour ça).
      const mandatDocument = buildMandatDocumentData({
        dossierId,
        demandeId: demande.id,
        mandatRepresentation: context.mandatRepresentation,
        mandatTransmission: context.mandatTransmission,
        mandatConfirmation: context.mandatConfirmation,
      });
      if (mandatDocument) {
        await tx.document.create({ data: mandatDocument });
      }
    }

    if (won) {
      const current = await tx.dossier.findUniqueOrThrow({ where: { id: dossierId }, select: { state: true } });
      // On ne transitionne que si le dossier est encore à son état initial :
      // s'il a déjà avancé entre-temps (par exemple par un conseiller), on
      // ne le fait pas reculer ni ne duplique une transition déjà faite.
      if (current.state === "NOUVEAU") {
        await transitionDossierInTransaction(tx, {
          dossierId,
          to: "QUALIFICATION",
          actorType: "CLIENT",
          actorId: clientId,
          comment: "Qualification effectuée via Lydie.",
        });
        await transitionDossierInTransaction(tx, {
          dossierId,
          to: "DOSSIER_EN_PREPARATION",
          actorType: "CLIENT",
          actorId: clientId,
          comment: "Informations de qualification transmises par Lydie.",
        });
      }
    }

    return tx.dossier.findUniqueOrThrow({ where: { id: dossierId } });
  });
}
