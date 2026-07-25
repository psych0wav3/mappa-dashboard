import type { ReactNode } from "react";

type FormPageProps = {
  children: ReactNode;
  className?: string;
};

export default function FormPage({
  children,
  className = "",
}: FormPageProps) {
  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-6 sm:px-6 lg:px-8">
      <div
        className={[
          "mx-auto max-w-7xl space-y-5",
          className,
        ].join(" ")}
      >
        {children}
      </div>
    </div>
  );
}