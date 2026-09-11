import { cn } from "../../lib/utils.js";

export function Badge({ className, variant = "default", ...props }) {
  const styles = variant === "secondary" ? "border-transparent bg-secondary text-secondary-foreground" : "border-transparent bg-primary text-primary-foreground";
  return <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors", styles, className)} {...props} />;
}
