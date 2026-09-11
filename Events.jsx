import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchEvents } from "@/lib/api";
import EventCard from "@/components/EventCard";

const TYPES = ["All", "Competition", "Workshop", "Seminar", "Cultural"];

function groupByDay(events) {
  const groups = {};
  for (const e of events) {
    const d = new Date(e.start_time);
    const key = d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    (groups[key] = groups[key] || []).push(e);
  }
  return Object.entries(groups);
}

export default function Events() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState("All");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchEvents({
      ...(type !== "All" ? { event_type: type } : {}),
      ...(query ? { search: query } : {}),
    })
      .then(setEvents)
      .finally(() => setLoading(false));
  }, [type, query]);

  const groups = useMemo(() => groupByDay(events), [events]);
  const clear = () => { setQuery(""); setType("All"); };

  return (
    <div className="space-y-8" data-testid="events-page">
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">Calendar</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold display tracking-tight">Every event, all in a row.</h1>
        <p className="text-slate-600 max-w-2xl">Competitions, workshops, seminars, cultural nights. {events.length} shown.</p>
      </div>

      <div className="sticky top-16 z-30 backdrop-blur-md bg-white/85 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues, topics..."
              className="pl-10 h-11 bg-white"
              data-testid="events-search-input"
            />
          </div>
          {(query || type !== "All") && (
            <Button variant="ghost" size="sm" onClick={clear} data-testid="events-clear-filters">
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              data-testid={`event-type-filter-${t.toLowerCase()}-button`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                type === t
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500">Loading events...</div>
      ) : groups.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white border border-dashed border-slate-300 rounded-xl" data-testid="events-empty-state">
          <div className="text-4xl">📅</div>
          <h3 className="font-bold display text-xl">No events match.</h3>
          <p className="text-slate-600">Try a different keyword or type.</p>
          <Button onClick={clear} variant="outline">Reset filters</Button>
        </div>
      ) : (
        <div className="space-y-8" data-testid="events-list">
          {groups.map(([day, items]) => (
            <div key={day} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="text-xs uppercase tracking-widest mono font-semibold text-slate-500">{day}</div>
                <div className="flex-1 h-px bg-slate-200" />
                <div className="text-xs mono text-slate-400">{items.length} event{items.length !== 1 && "s"}</div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {items.map((e) => <EventCard key={e.id} event={e} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
