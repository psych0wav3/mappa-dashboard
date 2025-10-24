import * as React from "react";

export default function FAQ() {
  const list = [
    { q: "Posso cancelar quando quiser?", a: "Sim. Os planos são mensais e você pode cancelar a qualquer momento." },
    { q: "O técnico precisa instalar algo?", a: "O app do técnico funciona no Android; a operação do escritório é via web." },
    { q: "Consigo importar meus clientes?", a: "Sim, fazemos importação por planilha e auxiliamos na limpeza dos dados." },
    { q: "Há testes grátis?", a: "Oferecemos 7 dias para você experimentar o fluxo completo." },
  ];

  return (
    <section id="faq" className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-pretty text-3xl font-bold tracking-tight sm:text-4xl">
          Perguntas frequentes
        </h2>
      </div>

      <div className="mx-auto mt-8 max-w-3xl divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white">
        {list.map((item) => (
          <details key={item.q} className="group p-6">
            <summary className="cursor-pointer list-none text-base font-semibold">
              {item.q}
            </summary>
            <p className="mt-2 text-slate-600">{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
