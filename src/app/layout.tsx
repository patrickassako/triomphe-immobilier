import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Triomphe Immobilier - Biens Immobiliers au Cameroun",
  description: "Votre partenaire de confiance pour l'achat, la vente et la location de biens immobiliers au Cameroun. Découvrez nos offres à Yaoundé, Douala et dans tout le pays.",
  keywords: "immobilier Cameroun, vente maison Yaoundé, location appartement Douala, terrain à vendre, villa Cameroun",
  openGraph: {
    title: "Triomphe Immobilier - Biens Immobiliers au Cameroun",
    description: "Votre partenaire de confiance pour l'immobilier au Cameroun",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="scroll-smooth">
      <body className="min-h-screen bg-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}