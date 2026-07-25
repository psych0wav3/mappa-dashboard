import type { ReactNode } from "react";

type FormFieldProps = {
  label: string;
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  description?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

export default function FormField({
  label,
  htmlFor,
  required = false,
  optional = false,
  description,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-2 block text-xs font-semibold text-slate-700"
      >
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}

        {optional && (
          <span className="ml-1 font-normal text-slate-400">
            (não obrigatório)
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs leading-5 text-red-600">
          {error}
        </p>
      ) : description ? (
        <p className="mt-1.5 text-xs leading-5 text-slate-400">
          {description}
        </p>
      ) : null}
    </div>
  );
}