import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { Header, Footer } from "@/components/chrome";

export const metadata: Metadata = {
  title: "MUSSLOCKER — Boutique Vêtements",
  description: "Vestes, jeans, robes & essentiels. Vu sur TikTok @musslocker. Paiement à la livraison 58 wilayas.",
  icons: { icon: "/muss.jpg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col bg-zinc-950 text-white antialiased">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
