import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { Search } from "lucide-react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  helperText?: string;
  search?: boolean;
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, search, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {search && (
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-11 w-full rounded-sm border border-border-strong bg-surface px-3 text-sm text-text-primary placeholder:text-text-muted",
              "outline-none transition-shadow duration-fast",
              "focus:border-primary focus:shadow-[0_0_0_3px_var(--color-primary-light)]",
              error && "border-danger focus:shadow-[0_0_0_3px_var(--color-danger-bg)]",
              search && "pl-9",
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-xs text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
export type { InputProps };
