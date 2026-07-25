import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type FormInfoBoxVariant =
  | "info"
  | "warning"
  | "success";

type FormInfoBoxProps = {
  icon: LucideIcon;
  children: ReactNode;
  variant?: FormInfoBoxVariant;
  compact?: boolean;
  className?: string;
};

const variantClasses: Record<
  FormInfoBoxVariant,
  {
    container: string;
    icon: string;
    text: string;
  }
> = {
  info: {
    container:
      "border-sky-100 bg-sky-50",
    icon: "text-sky-700",
    text: "text-sky-800",
  },

  warning: {
    container:
      "border-amber-200 bg-amber-50",
    icon: "text-amber-700",
    text: "text-amber-800",
  },

  success: {
    container:
      "border-emerald-200 bg-emerald-50",
    icon: "text-emerald-700",
    text: "text-emerald-800",
  },
};

export default function FormInfoBox({
  icon: Icon,
  children,
  variant = "info",
  compact = false,
  className = "",
}: FormInfoBoxProps) {
  const styles = variantClasses[variant];

  return (
    <div
      className={[
        "flex items-center gap-3 rounded-xl border px-4",
        compact ? "h-11" : "py-3",
        styles.container,
        className,
      ].join(" ")}
    >
      <Icon
        className={[
          "h-4 w-4 shrink-0",
          styles.icon,
        ].join(" ")}
      />

      <div
        className={[
          "text-xs leading-5",
          styles.text,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}