import { CalendarDays } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { BirthdayCalendar } from "@/features/birthdays/components/birthday-calendar";
import { getBirthdayData } from "@/features/birthdays/queries";

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ familyId: string }>;
}) {
  const { familyId } = await params;
  const data = await getBirthdayData(familyId);
  return (
    <div>
      <PageHeader
        eyebrow="Rodzinny rytm"
        title="Kalendarz"
        description="Najbliższe urodziny i ważne rodzinne daty w jednym miejscu."
        action={
          <CalendarDays className="hidden size-10 rounded-2xl bg-accent p-2 text-primary sm:block" />
        }
      />
      <BirthdayCalendar familyId={familyId} {...data} />
    </div>
  );
}
