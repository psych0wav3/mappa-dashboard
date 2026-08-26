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
  title,
  description,
  actions,
  className = "",
}: FormPageHeaderProps) {
  return (
    <header
      className={[
        "rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:items-center">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600 sm:h-10 sm:w-10">
            <Icon className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="break-words text-base font-bold leading-snug text-slate-900 sm:text-lg">
              {title}
            </h1>

            {description ? (
              <p className="mt-1 max-w-3xl break-words text-xs leading-5 text-slate-500 sm:mt-0.5 sm:text-sm">
                {description}
              </p>
            ) : null}
          </div>
        </div>

        {actions ? (
          <div className="flex w-full shrink-0 items-center sm:w-auto">
            {actions}
          </div>
        ) : null}
      </div>
    </header>
  );
}
