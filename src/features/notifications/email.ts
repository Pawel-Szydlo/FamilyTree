import { Resend } from "resend";
import { FAMILY_TIME_ZONE, formatBirthday } from "../birthdays/date";

export type ReminderType = "birthday_7_days" | "birthday_today";
export type BirthdayEmail = {
  recipient: string;
  personName: string;
  familyName: string;
  month: number;
  day: number;
  year: number;
  type: ReminderType;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Missing RESEND_API_KEY.");
  return new Resend(apiKey);
}

function getSender() {
  const sender = process.env.RESEND_FROM_EMAIL;
  if (!sender) throw new Error("Missing RESEND_FROM_EMAIL.");
  return sender;
}

export function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ] ?? character,
  );
}

export function renderBirthdayEmail(input: BirthdayEmail) {
  const date = formatBirthday(input.month, input.day);
  const safePersonName = escapeHtml(input.personName);
  const safeFamilyName = escapeHtml(input.familyName);
  const subject =
    input.type === "birthday_today"
      ? `Dzisiaj urodziny: ${safePersonName}`
      : `Urodziny za 7 dni: ${safePersonName}`;
  const intro =
    input.type === "birthday_today"
      ? `Dzisiaj przypadają urodziny osoby ${safePersonName}.`
      : "Za 7 dni, " +
        date +
        ", przypadają urodziny osoby " +
        safePersonName +
        ".";
  return {
    subject,
    html:
      "<main><h1>" +
      subject +
      "</h1><p>" +
      intro +
      "</p><p>Rodzina: " +
      safeFamilyName +
      "</p><p>Strefa dat: " +
      FAMILY_TIME_ZONE +
      ".</p></main>",
    text:
      intro +
      " Rodzina: " +
      safeFamilyName +
      ". Strefa dat: " +
      FAMILY_TIME_ZONE +
      ".",
  };
}

export async function sendBirthdayEmail(input: BirthdayEmail) {
  if (!isValidEmail(input.recipient)) {
    throw new Error("Invalid recipient email address.");
  }
  const message = renderBirthdayEmail(input);
  const result = await getResend().emails.send({
    from: getSender(),
    to: input.recipient,
    subject: message.subject,
    html: message.html,
    text: message.text,
  });
  if (result.error) throw new Error("Resend rejected the message.");
  return result.data?.id ?? null;
}
