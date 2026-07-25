import type { LucideIcon } from "lucide-react";

type FormSectionHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  step?: number;
};

export default function FormSectionHeader({
  icon: Icon,
  title,
  description,
  step,
}: FormSectionHeaderProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
        <Icon className="h-4 w-4" />

        {typeof step === "number" && (
          <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full border-2 border-white bg-sky-600 px-1 text-[10px] font-bold text-white">
            {step}
          </span>
        )}
      </div>

      <div className="min-w-0">
        <h2 className="text-sm font-semibold text-slate-900">
          {title}
        </h2>

        <p className="mt-0.5 text-xs leading-5 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}