// src/app/(site)/page.tsx
import Hero from "@/components/site/Hero";
import BenefitsSection from "@/components/site/BenefitsSection";

export const metadata = {
  title: "PiscinApp — Software para empresas de piscinas",
  description:
    "Planeje rotas, organize visitas, registre químicos e fotos; envie relatórios profissionais em minutos.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <Hero />
      <BenefitsSection />
    </main>
  );
}
