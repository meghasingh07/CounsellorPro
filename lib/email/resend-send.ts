import nodemailer from "nodemailer";

export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

function getTransport() {
  const user = process.env.GMAIL_USER?.trim();
  const pass = process.env.GMAIL_APP_PASSWORD?.trim();

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    service: "gmail",
    auth: { user, pass },
  });
}

/** Best-effort transactional send using Gmail SMTP (app password). */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    console.warn("[email] Gmail SMTP not configured — skipping send to", input.to);
    return;
  }

  const from = process.env.SMTP_FROM_EMAIL?.trim() || process.env.GMAIL_USER?.trim() || "";
  if (!from) {
    console.warn("[email] Missing sender address — skipping send to", input.to);
    return;
  }

  await transport.sendMail({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
    ...(input.html ? { html: input.html } : {}),
  });
}