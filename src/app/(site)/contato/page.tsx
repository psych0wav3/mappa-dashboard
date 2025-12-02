// src/app/(site)/contato/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato – Kora Studio",
};

export default function ContatoPage() {
  return (
    <main className="py-[60px] md:py-[80px] lg:py-[100px] xl:py-[120px]">
      <div className="container md:max-w-[960px] 2xl:max-w-[1320px] mx-auto px-[12px]">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-[28px] md:text-[36px] lg:text-[42px] font-semibold mb-3">
            Fale com a gente
          </h1>
          <p className="text-gray-700 dark:text-gray-200">
            Quer tirar uma dúvida, fazer um orçamento ou conversar sobre um
            projeto? Envie uma mensagem e retornamos o mais rápido possível.
          </p>
        </div>

        <div className="max-w-xl mx-auto rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0f0f18] p-6 space-y-4">
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Nome</label>
              <input
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#050510] px-3 py-2 text-sm"
                placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">E-mail</label>
              <input
                type="email"
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#050510] px-3 py-2 text-sm"
                placeholder="voce@empresa.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Mensagem</label>
              <textarea
                rows={4}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#050510] px-3 py-2 text-sm"
                placeholder="Conte um pouco sobre o que você precisa :)"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold bg-pink-600 text-white hover:bg-pink-700 transition"
            >
              Enviar mensagem
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
