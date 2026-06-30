import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const badgeVariants = {
  aman: "bg-success-bg text-success",
  menipis: "bg-warning-bg text-warning",
  habis: "bg-danger-bg text-danger",
  diskon: "bg-danger text-white",
  kritis: "bg-danger-bg text-danger",
  ai: "bg-info-bg text-info",
  default: "bg-primary-light text-primary",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof badgeVariants;
};

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        badgeVariants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export { Badge };
export type { BadgeProps };
