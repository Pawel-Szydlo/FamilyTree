import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

export type InvitationRecord = {
  id: string;
  email: string;
  role: "admin" | "editor" | "member" | "viewer";
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
  created_at: string;
};

export type MemberRecord = {
  user_id: string;
  role: "owner" | "admin" | "editor" | "member" | "viewer";
  status: "active" | "suspended";
  email: string | null;
  joined_at: string;
};

async function isManager(familyId: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return { supabase, allowed: false, userId: null };
  const membership = await supabase
    .from("family_members")
    .select("role")
    .eq("family_id", familyId)
    .eq("user_id", auth.user.id)
    .eq("status", "active")
    .maybeSingle();
  return {
    supabase,
    allowed: ["owner", "admin"].includes(membership.data?.role),
    userId: auth.user.id,
  };
}

export async function getInvitationData(familyId: string) {
  const { supabase, allowed } = await isManager(familyId);
  if (!allowed) return { members: [], invitations: [], canManage: false };
  const [membersResult, invitationsResult] = await Promise.all([
    supabase
      .from("family_members")
      .select("user_id, role, status, joined_at")
      .eq("family_id", familyId)
      .order("joined_at", { ascending: true }),
    supabase
      .from("invitations")
      .select("id, email, role, status, expires_at, created_at")
      .eq("family_id", familyId)
      .order("created_at", { ascending: false }),
  ]);
  if (membersResult.error) throw membersResult.error;
  if (invitationsResult.error) throw invitationsResult.error;
  let service: ReturnType<typeof createServiceClient> | null = null;
  try {
    service = createServiceClient();
  } catch {
    service = null;
  }
  const members = await Promise.all(
    (membersResult.data ?? []).map(async (member) => {
      const user = service
        ? await service.auth.admin.getUserById(member.user_id)
        : { data: { user: null } };
      return {
        ...member,
        email: user.data.user?.email ?? null,
      } as MemberRecord;
    }),
  );
  return {
    members,
    invitations: (invitationsResult.data ?? []).map((invitation) => ({
      ...invitation,
      status:
        invitation.status === "pending" &&
        new Date(invitation.expires_at).getTime() <= Date.now()
          ? "expired"
          : invitation.status,
    })) as InvitationRecord[],
    canManage: true,
  };
}
