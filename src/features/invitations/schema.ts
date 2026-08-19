import { z } from "zod";

export const invitationRoleSchema = z.enum([
  "admin",
  "editor",
  "member",
  "viewer",
]);

export const createInvitationSchema = z.object({
  family_id: z.string().uuid(),
  email: z.string().trim().toLowerCase().email("Podaj poprawny adres e-mail."),
  role: invitationRoleSchema,
});

export type InvitationRole = z.infer<typeof invitationRoleSchema>;
