import { Children, isValidElement } from "react";

function findItems(children, result = []) {
  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return;
    if (child.type === SelectItem) result.push(child.props);
    if (child.props?.children) findItems(child.props.children, result);
  });
  return result;
}

export function Select({ value, onValueChange, children }) {
  const items = findItems(children);
  return (
    <select value={value} onChange={(event) => onValueChange?.(event.target.value)} className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
      {items.map((item) => <option key={item.value} value={item.value}>{item.children}</option>)}
    </select>
  );
}
export function SelectTrigger() { return null; }
export function SelectValue() { return null; }
export function SelectContent({ children }) { return <>{children}</>; }
export function SelectItem({ value, children }) { return <option value={value}>{children}</option>; }
