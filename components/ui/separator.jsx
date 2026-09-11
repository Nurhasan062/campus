export function Separator({ className = "", orientation = "horizontal", ...props }) {
  return <div role="separator" className={`${orientation === "vertical" ? "h-full w-px" : "h-px w-full"} shrink-0 bg-border ${className}`} {...props} />;
}
