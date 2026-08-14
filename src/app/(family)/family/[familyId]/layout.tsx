import { FamilyShell } from "@/components/shared/navigation";

export default function FamilyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FamilyShell>{children}</FamilyShell>;
}
