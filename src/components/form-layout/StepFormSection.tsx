import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import FormSection from "./FormSection";

type StepFormSectionProps = {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function StepFormSection({
  step,
  icon,
  title,
  description,
  children,
  className = "",
  contentClassName = "",
}: StepFormSectionProps) {
  return (
    <FormSection
      step={step}
      icon={icon}
      title={title}
      description={description}
      className={className}
      contentClassName={contentClassName}
    >
      {children}
    </FormSection>
  );
}