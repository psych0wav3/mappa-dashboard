import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FormPageHeaderProps = {
  icon: LucideIcon;
  badge?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function FormPageHeader({
  icon: Icon,
  badge,
  title,
  description,
  actions,
  className = "",
}: FormPageHeaderProps) {
  return (
    <header
      className={[
        "rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="min-w-0">
            {badge && (
              <div className="mb-2 inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                {badge}
              </div>
            )}

            <h1 className="text-xl font-bold tracking-tight text-slate-950">
              {title}
            </h1>

            {description && (
              <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
                {description}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex shrink-0 items-center">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}