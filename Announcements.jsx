import { useEffect, useState } from "react";
import { Pin, Megaphone } from "lucide-react";
import { fetchAnnouncements } from "@/lib/api";

const CATS = ["All", "General", "Urgent", "Academic", "Event"];

const CAT_STYLES = {
  Urgent: { pill: "bg-red-50 text-red-700 border-red-200", accent: "border-l-red-500" },
  Academic: { pill: "bg-sky-50 text-sky-700 border-sky-200", accent: "border-l-sky-500" },
  Event: { pill: "bg-violet-50 text-violet-700 border-violet-200", accent: "border-l-violet-500" },
  General: { pill: "bg-slate-100 text-slate-700 border-slate-200", accent: "border-l-slate-400" },
};

function fmtDate(d) {
  return new Date(d).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export default function Announcements() {
  const [cat, setCat] = useState("All");
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetchAnnouncements(cat !== "All" ? { category: cat } : {}).then(setItems);
  }, [cat]);

  return (
    <div className="space-y-8" data-testid="announcements-page">
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold flex items-center gap-2"><Megaphone className="h-3.5 w-3.5" /> Signals</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold display tracking-tight">Everything happening on campus.</h1>
        <p className="text-slate-600 max-w-2xl">Pinned notices, urgent alerts, academic updates — sorted so nothing important slips by.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            data-testid={`announcement-filter-${c.toLowerCase()}-button`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              cat === c ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-900 hover:text-slate-900"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4" data-testid="announcements-list">
        {items.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-white border border-dashed border-slate-300 rounded-xl">Nothing to show yet.</div>
        ) : (
          items.map((a) => {
            const s = CAT_STYLES[a.category] || CAT_STYLES.General;
            return (
              <div
                key={a.id}
                data-testid={`announcement-card-${a.id}`}
                className={`bg-white border border-slate-200 border-l-4 ${s.accent} rounded-xl p-5 card-lift`}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-widest mono font-semibold px-2 py-1 rounded-full border ${s.pill}`}>{a.category}</span>
                    {a.is_pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-widest mono font-semibold text-amber-700">
                        <Pin className="h-3 w-3" /> Pinned
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 mono">{fmtDate(a.created_at)}</span>
                </div>
                <h3 className="font-bold display text-xl mt-3">{a.title}</h3>
                <p className="text-slate-700 mt-2 leading-relaxed">{a.body}</p>
                <div className="mt-3 text-xs text-slate-400 mono">by {a.posted_by}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
