import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FamilyTree — rodzinny album",
    template: "%s — FamilyTree",
  },
  description: "Prywatne miejsce na rodzinne drzewo, zdjęcia i wspomnienia.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
