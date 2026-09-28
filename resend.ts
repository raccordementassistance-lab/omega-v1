import { Resend } from "resend";
import { prisma } from "@/lib/prisma";
import { Errors } from "@/lib/errors";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

/**
 * Envoie un e-mail transactionnel et historise systématiquement le résultat
 * dans email_logs (dossierId optionnel — voir migration
 * 20260119083000_lydie_step_et_emaillog_nullable). Un log est écrit même en
 * cas d'échec, avec le statut FAILED, pour garder une trace exploitable.
 */
export async function sendTransactionalEmail(params: {
  to: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  dossierId?: string;
}) {
  const from = process.env.EMAIL_FROM ?? "Raccordement Assistance <contact@raccordement-assistance.fr>";

  if (!resend) {
    // Pas de clé configurée (ex. environnement de dev sans Resend) : on logue
    // l'échec plutôt que de simuler un envoi silencieux qui masquerait le problème.
    await prisma.emailLog.create({
      data: {
        dossierId: params.dossierId,
        toAddress: params.to,
        fromAddress: from,
        subject: params.subject,
        bodyPreview: params.bodyText.slice(0, 500),
        provider: "resend",
        status: "FAILED",
        errorMessage: "RESEND_API_KEY absente — envoi non configuré.",
      },
    });
    throw Errors.upstream("Le service d'envoi d'e-mail n'est pas configuré.");
  }

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      text: params.bodyText,
      html: params.bodyHtml,
    });

    await prisma.emailLog.create({
      data: {
        dossierId: params.dossierId,
        toAddress: params.to,
        fromAddress: from,
        subject: params.subject,
        bodyPreview: params.bodyText.slice(0, 500),
        provider: "resend",
        status: result.error ? "FAILED" : "SENT",
        errorMessage: result.error?.message,
        sentAt: result.error ? undefined : new Date(),
      },
    });

    if (result.error) throw Errors.upstream(`Échec de l'envoi : ${result.error.message}`);
    return result;
  } catch (err) {
    if (err instanceof Error && err.name === "AppError") throw err;
    await prisma.emailLog.create({
      data: {
        dossierId: params.dossierId,
        toAddress: params.to,
        fromAddress: from,
        subject: params.subject,
        bodyPreview: params.bodyText.slice(0, 500),
        provider: "resend",
        status: "FAILED",
        errorMessage: err instanceof Error ? err.message : "Erreur inconnue",
      },
    });
    throw Errors.upstream("Échec de l'envoi de l'e-mail.");
  }
}
