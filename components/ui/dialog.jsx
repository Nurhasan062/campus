import { cloneElement, createContext, useContext } from "react";
import { cn } from "../../lib/utils.js";

const DialogContext = createContext(null);

export function Dialog({ open, onOpenChange, children }) {
  return <DialogContext.Provider value={{ open, onOpenChange }}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild, children }) {
  const dialog = useContext(DialogContext);
  const handleClick = (event) => {
    children.props?.onClick?.(event);
    if (!event.defaultPrevented) dialog?.onOpenChange(true);
  };
  if (asChild) return <>{cloneWithClick(children, handleClick)}</>;
  return <button onClick={handleClick}>{children}</button>;
}

function cloneWithClick(child, onClick) {
  return cloneElement(child, { onClick });
}

export function DialogContent({ className, children, ...props }) {
  const dialog = useContext(DialogContext);
  if (!dialog?.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4" onMouseDown={() => dialog.onOpenChange(false)}>
      <div className={cn("relative w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg", className)} onMouseDown={(event) => event.stopPropagation()} {...props}>
        <button type="button" aria-label="Close" className="absolute right-4 top-4 text-slate-500 hover:text-slate-900" onClick={() => dialog.onOpenChange(false)}>×</button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({ className = "", ...props }) { return <div className={`flex flex-col space-y-1.5 text-center sm:text-left ${className}`} {...props} />; }
export function DialogTitle({ className = "", ...props }) { return <h2 className={`text-lg font-semibold ${className}`} {...props} />; }
export function DialogDescription({ className = "", ...props }) { return <p className={`text-sm text-muted-foreground ${className}`} {...props} />; }
export function DialogFooter({ className = "", ...props }) { return <div className={`flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 ${className}`} {...props} />; }
