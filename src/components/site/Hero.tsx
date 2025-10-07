// src/components/site/Hero.tsx
export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* fundo azul escuro */}
      <div className="absolute inset-0 bg-[#121637]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 lg:py-24 grid lg:grid-cols-2 gap-10 items-center">
        {/* COPY (esquerda) */}
        <div className="text-white">
          <h1 className="text-4xl/tight md:text-5xl font-extrabold tracking-tight">
            O software nº1 para{" "}
            <span className="text-orange-400">gestão de rotas</span> e
            manutenção de piscinas
          </h1>
          <p className="mt-5 text-lg text-white/80">
            Economize tempo, aumente a receita e encante seus clientes com a
            plataforma all-in-one do PiscinApp: rotas, visitas, checklists,
            químicos, fotos e relatórios.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="/login"
              className="rounded-xl bg-orange-400 text-[#121637] px-5 py-3 font-semibold hover:bg-orange-300"
            >
              Começar agora
            </a>
            <a
              href="/contato"
              className="rounded-xl bg-white/10 px-5 py-3 font-semibold hover:bg-white/20"
            >
              Agendar uma demo
            </a>
          </div>
        </div>

        {/* IMAGEM (direita, card 4:3 como no primeiro hero) */}
        <div className="relative">
          <div className="relative aspect-[4/3] w-full max-w-[640px] ml-auto rounded-3xl overflow-hidden ring-1 ring-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
            <img
              src="/hero-pool.jpg"
              alt="App em uso à beira da piscina"
              className="h-full w-full object-cover"
            />
            {/* ondas decorativas no canto superior direito */}
            <svg
              className="absolute -right-6 top-6 opacity-70"
              width="120"
              height="120"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden
            >
              {Array.from({ length: 5 }).map((_, i) => (
                <path
                  key={i}
                  d="M0,20 C20,35 40,5 60,20 C80,35 100,5 120,20"
                  stroke="white"
                  strokeOpacity="0.55"
                  strokeWidth="2"
                  transform={`translate(0 ${i * 16})`}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* separador “onda” */}
      <svg className="block w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden>
        <path
          d="M0,80 C240,120 360,0 600,40 C840,80 1080,0 1440,60 L1440,120 L0,120 Z"
          fill="#121637"
        />
        <path
          d="M0,95 C240,135 360,15 600,55 C840,95 1080,15 1440,75 L1440,120 L0,120 Z"
          fill="#e0f2ff"
        />
      </svg>
    </section>
  );
}
