import { Bell } from "lucide-react";

export default function AnnouncementTicker({ items = [] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];
  return (
    <div
      className="w-full bg-slate-900 text-white border-y border-slate-800 overflow-hidden"
      data-testid="announcements-ticker"
    >
      <div className="mx-auto max-w-7xl flex items-center gap-4 min-w-0">
        <div className="hidden sm:flex items-center gap-2 pl-4 py-2.5 shrink-0 border-r border-slate-700 pr-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <Bell className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-widest mono font-semibold">Live</span>
        </div>
        <div className="flex-1 overflow-hidden min-w-0">
          <div className="marquee-track flex whitespace-nowrap gap-10 py-2.5" style={{ width: "max-content" }}>
            {doubled.map((a, i) => (
              <span key={i} className="text-sm text-slate-100 inline-flex items-center gap-3">
                <span className="uppercase text-[10px] tracking-widest mono text-emerald-300">{a.category}</span>
                <span className="font-medium">{a.title}</span>
                <span className="text-slate-500">·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
