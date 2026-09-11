import { cloneElement, createContext, useContext } from "react";
import { cn } from "../../lib/utils.js";

const SheetContext = createContext(null);

export function Sheet({ open, onOpenChange, children }) {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>;
}

export function SheetTrigger({ asChild, children }) {
  const sheet = useContext(SheetContext);
  const onClick = (event) => {
    children.props?.onClick?.(event);
    if (!event.defaultPrevented) sheet?.onOpenChange(true);
  };
  return asChild ? cloneElement(children, { onClick }) : <button onClick={onClick}>{children}</button>;
}

export function SheetContent({ side = "right", className, children, ...props }) {
  const sheet = useContext(SheetContext);
  if (!sheet?.open) return null;
  const position = side === "left" ? "left-0 border-r" : "right-0 border-l";
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/50" onMouseDown={() => sheet.onOpenChange(false)}>
      <div className={cn("fixed inset-y-0 z-50 w-3/4 max-w-sm bg-background p-6 shadow-lg", position, className)} onMouseDown={(event) => event.stopPropagation()} {...props}>
        <button type="button" aria-label="Close" className="absolute right-4 top-4 text-slate-500 hover:text-slate-900" onClick={() => sheet.onOpenChange(false)}>×</button>
        {children}
      </div>
    </div>
  );
}
