import { Resend } from "resend";

export async function sendInvitationEmail(input: {
  recipient: string;
  familyName: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const sender = process.env.RESEND_FROM_EMAIL;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!apiKey || !sender || !appUrl) {
    throw new Error("Invitation email is not configured.");
  }
  const inviteUrl = `${appUrl.replace(/\/$/, "")}/invite?token=${encodeURIComponent(input.token)}`;
  const result = await new Resend(apiKey).emails.send({
    from: sender,
    to: input.recipient,
    subject: `Zaproszenie do rodziny ${input.familyName}`,
    text: `Zaproszono Cię do rodziny ${input.familyName}. Otwórz: ${inviteUrl}`,
    html: `<p>Zaproszono Cię do rodziny <strong>${input.familyName}</strong>.</p><p><a href="${inviteUrl}">Akceptuj zaproszenie</a></p><p>Link wygasa za 7 dni.</p>`,
  });
  if (result.error) throw new Error("Invitation email was rejected.");
}
