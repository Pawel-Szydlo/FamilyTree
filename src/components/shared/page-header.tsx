import type { ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 border-b border-border px-5 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8">
      <div>
        <p className="text-sm font-medium text-primary/70">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-primary">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
