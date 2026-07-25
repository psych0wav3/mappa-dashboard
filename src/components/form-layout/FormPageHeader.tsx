import type { LucideIcon } from "lucide-react";

type FormPageHeaderProps = {
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  className?: string;
};

export default function FormPageHeader({
  icon: Icon,
  badge,
  title,
  description,
  className = "",
}: FormPageHeaderProps) {
  return (
    <header
      className={[
        "rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-6",
        className,
      ].join(" ")}
    >
      <div className="flex items-start gap-4">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-sky-50 text-sky-700">
          <Icon className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <div className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
            {badge}
          </div>

          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>

          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </header>
  );
}