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

export default function FormPageHeader({ icon: Icon, title, description, actions, className = "" }: FormPageHeaderProps) {
  return (
    <header className={["rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6", className].filter(Boolean).join(" ")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-600">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            {description && <p className="mt-0.5 max-w-3xl text-sm text-slate-500">{description}</p>}
          </div>
        </div>

        {actions && <div className="flex shrink-0 items-center">{actions}</div>}
      </div>
    </header>
  );
}