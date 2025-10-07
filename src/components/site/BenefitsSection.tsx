// src/components/site/BenefitsSection.tsx
export default function BenefitsSection() {
  const items = [
    {
      t: "Rotas inteligentes",
      d: "Monte rotas semanais, otimize a ordem e comprove presença via QR + GPS.",
    },
    {
      t: "Qualidade garantida",
      d: "Registre pH, cloro e checklists; fotos de antes/depois em cada visita.",
    },
    {
      t: "Relatórios instantâneos",
      d: "Envie para o dono da piscina um resumo limpo e profissional.",
    },
  ];

  return (
    <section className="bg-[#e0f2ff] -mt-px">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 grid md:grid-cols-3 gap-6">
        {items.map((f, i) => (
          <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <h3 className="font-semibold text-neutral-900">{f.t}</h3>
            <p className="mt-2 text-sm text-neutral-600">{f.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
