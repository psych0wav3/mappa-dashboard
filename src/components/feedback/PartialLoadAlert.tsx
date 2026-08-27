import { AlertTriangle } from "lucide-react";

type PartialLoadAlertProps = {
  resources: string[];
};

export default function PartialLoadAlert({
  resources,
}: PartialLoadAlertProps) {
  if (resources.length === 0) {
    return null;
  }

  return (
    <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-950">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

      <div className="min-w-0">
        <p className="text-sm font-semibold">
          Alguns dados não puderam ser carregados
        </p>

        <p className="mt-1 text-sm leading-5 text-amber-800">
          A página continua disponível, mas houve uma falha
          temporária ao carregar {resources.join(", ")}. Tente
          atualizar a página antes de continuar.
        </p>
      </div>
    </div>
  );
}