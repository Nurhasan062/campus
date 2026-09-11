import { createContext, useContext, useState } from "react";

const TabsContext = createContext(null);

export function Tabs({ defaultValue, children, className = "" }) {
  const [value, setValue] = useState(defaultValue);
  return <TabsContext.Provider value={{ value, setValue }}><div className={className}>{children}</div></TabsContext.Provider>;
}
export function TabsList({ className = "", ...props }) { return <div role="tablist" className={`inline-flex h-10 items-center justify-center rounded-md p-1 text-muted-foreground ${className}`} {...props} />; }
export function TabsTrigger({ value, className = "", ...props }) {
  const tabs = useContext(TabsContext);
  const active = tabs?.value === value;
  return <button type="button" role="tab" aria-selected={active} onClick={() => tabs?.setValue(value)} className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all ${active ? "bg-background text-foreground shadow-sm" : "hover:bg-background/50"} ${className}`} {...props} />;
}
export function TabsContent({ value, className = "", ...props }) {
  const tabs = useContext(TabsContext);
  if (tabs?.value !== value) return null;
  return <div role="tabpanel" className={className} {...props} />;
}
