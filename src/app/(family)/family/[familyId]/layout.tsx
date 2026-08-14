import { notFound, redirect } from "next/navigation";
import { FamilyShell } from "@/components/shared/navigation";
import { getCurrentUser, getFamilyById } from "@/features/families/queries";

export default function FamilyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ familyId: string }>;
}) {
  return <FamilyLayoutContent params={params}>{children}</FamilyLayoutContent>;
}

async function FamilyLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/family/${familyId}/tree`);

  const family = await getFamilyById(familyId);
  if (!family) notFound();

  return (
    <FamilyShell
      familyId={family.id}
      familyName={family.name}
      email={user.email ?? "Użytkownik"}
    >
      {children}
    </FamilyShell>
  );
}
