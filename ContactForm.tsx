"use client";

import * as React from "react";
import { z } from "zod";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom complet."),
  email: z.string().trim().email("Indiquez une adresse e-mail valide."),
  subject: z.string().trim().min(3, "Indiquez un sujet."),
  message: z.string().trim().min(10, "Votre message doit contenir au moins 10 caractères."),
});

type ContactValues = z.infer<typeof contactSchema>;
type FieldErrors = Partial<Record<keyof ContactValues, string>>;
type Status = "idle" | "submitting" | "success" | "error" | "unavailable";

const initialValues: ContactValues = { name: "", email: "", subject: "", message: "" };

/**
 * Formulaire de contact.
 *
 * Le backend n'expose pas encore de route `/api/contact` (Module 3).
 * On appelle malgré tout cette route de façon honnête : si elle répond
 * 404/erreur, on l'affiche clairement à l'utilisateur avec une solution
 * de repli par e-mail, plutôt que de simuler un envoi réussi.
 */
export function ContactForm() {
  const [values, setValues] = React.useState<ContactValues>(initialValues);
  const [errors, setErrors] = React.useState<FieldErrors>({});
  const [status, setStatus] = React.useState<Status>("idle");

  function handleChange(field: keyof ContactValues) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setValues((v) => ({ ...v, [field]: e.target.value }));
    };
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors: FieldErrors = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0] as keyof ContactValues;
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setStatus("submitting");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });

      if (response.ok) {
        setStatus("success");
        setValues(initialValues);
        return;
      }

      if (response.status === 404) {
        setStatus("unavailable");
        return;
      }

      setStatus("error");
    } catch {
      setStatus("unavailable");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-m border border-success bg-success-soft p-6 text-success">
        <p className="font-semibold">Votre message a bien été envoyé.</p>
        <p className="mt-1 text-sm">Nous vous répondrons dans les meilleurs délais.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {status === "unavailable" ? (
        <div className="rounded-m border border-warn bg-warn-soft p-4 text-sm text-warn">
          Le formulaire de contact n&apos;est pas encore connecté à notre messagerie. En
          attendant, écrivez-nous directement à{" "}
          <a href="mailto:contact@raccordement-assistance.fr" className="font-semibold underline">
            contact@raccordement-assistance.fr
          </a>
          .
        </div>
      ) : null}

      {status === "error" ? (
        <div className="rounded-m border border-warn bg-warn-soft p-4 text-sm text-warn">
          Une erreur est survenue lors de l&apos;envoi. Merci de réessayer dans quelques instants.
        </div>
      ) : null}

      <Field label="Nom complet" htmlFor="name" error={errors.name}>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          value={values.name}
          onChange={handleChange("name")}
          className={inputClasses(Boolean(errors.name))}
          aria-invalid={Boolean(errors.name)}
        />
      </Field>

      <Field label="Adresse e-mail" htmlFor="email" error={errors.email}>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange("email")}
          className={inputClasses(Boolean(errors.email))}
          aria-invalid={Boolean(errors.email)}
        />
      </Field>

      <Field label="Sujet" htmlFor="subject" error={errors.subject}>
        <input
          id="subject"
          name="subject"
          type="text"
          value={values.subject}
          onChange={handleChange("subject")}
          className={inputClasses(Boolean(errors.subject))}
          aria-invalid={Boolean(errors.subject)}
        />
      </Field>

      <Field label="Message" htmlFor="message" error={errors.message}>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={values.message}
          onChange={handleChange("message")}
          className={inputClasses(Boolean(errors.message))}
          aria-invalid={Boolean(errors.message)}
        />
      </Field>

      <Button type="submit" size="lg" disabled={status === "submitting"} className="w-full sm:w-auto">
        {status === "submitting" ? "Envoi en cours…" : "Envoyer le message"}
      </Button>
    </form>
  );
}

function inputClasses(hasError: boolean) {
  return cn(
    "w-full rounded-m border bg-bg-raised px-4 py-2.5 text-sm text-ink outline-none transition-colors",
    "focus:border-primary",
    hasError ? "border-warn" : "border-line"
  );
}

function Field({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1.5 text-sm text-warn" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
