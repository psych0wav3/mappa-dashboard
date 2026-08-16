import type { ReactNode } from "react";

type FormPageProps = {
  children: ReactNode;
  className?: string;
};

export default function FormPage({ children, className = "" }: FormPageProps) {
  return <div className={["space-y-5", className].filter(Boolean).join(" ")}>{children}</div>;
}
