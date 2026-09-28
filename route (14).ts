import { withErrorHandling, ok } from "@/lib/errors";
import { contactSchema } from "@/lib/validations/contact";
import { sendTransactionalEmail } from "@/lib/email/resend";

/**
 * POST /api/contact — public, aucune authentification requise.
 * Body identique au schéma déjà écrit côté Module 4 (ContactForm.tsx),
 * revalidé ici côté serveur. dossierId omis : voir email_logs nullable
 * (migration 20260119083000).
 */
export const POST = withErrorHandling(async (request: Request) => {
  const body = contactSchema.parse(await request.json());

  const internalInbox = process.env.EMAIL_FROM ?? "contact@raccordement-assistance.fr";

  await sendTransactionalEmail({
    to: internalInbox,
    subject: `[Contact] ${body.subject}`,
    bodyText: `De : ${body.name} <${body.email}>\n\n${body.message}`,
  });

  return ok({ success: true });
});
