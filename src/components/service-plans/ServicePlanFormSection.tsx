import type { ReactNode } from "react";

type ServicePlanFormSectionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
};

export function ServicePlanFormSection({
  icon,
  title,
  description,
  children,
}: ServicePlanFormSectionProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          {icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {title}
          </h3>

          <p className="mt-0.5 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5">
        {children}
      </div>
    </div>
  );
}