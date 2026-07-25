import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import FormSectionHeader from "./FormSectionHeader";

type FormSectionProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  step?: number;
  className?: string;
  contentClassName?: string;
};

export default function FormSection({
  icon,
  title,
  description,
  children,
  step,
  className = "",
  contentClassName = "",
}: FormSectionProps) {
  return (
    <section
      className={[
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6",
        className,
      ].join(" ")}
    >
      <FormSectionHeader
        icon={icon}
        title={title}
        description={description}
        step={step}
      />

      <div
        className={[
          "mt-5",
          contentClassName,
        ].join(" ")}
      >
        {children}
      </div>
    </section>
  );
}