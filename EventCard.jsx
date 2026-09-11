import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_COLORS = {
  Competition: "bg-rose-50 text-rose-700 border-rose-200",
  Workshop: "bg-blue-50 text-blue-700 border-blue-200",
  Seminar: "bg-sky-50 text-sky-700 border-sky-200",
  Cultural: "bg-amber-50 text-amber-700 border-amber-200",
  Fest: "bg-violet-50 text-violet-700 border-violet-200",
};

const STATUS = {
  open: { label: "Open", cls: "bg-emerald-100 text-emerald-700" },
  limited: { label: "Limited Seats", cls: "bg-amber-100 text-amber-700" },
  closed: { label: "Closed", cls: "bg-red-100 text-red-700" },
};

function fmt(d) {
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
}
function fmtTime(d) {
  const dt = new Date(d);
  return dt.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function EventCard({ event }) {
  const typeCls = TYPE_COLORS[event.event_type] || "bg-slate-50 text-slate-700 border-slate-200";
  const st = STATUS[event.registration_status] || STATUS.open;

  return (
    <Link
      to={`/events/${event.id}`}
      data-testid={`event-card-${event.id}`}
      className="card-lift group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-w-0"
    >
      <div className="relative md:w-56 shrink-0 h-40 md:h-auto bg-slate-100 overflow-hidden">
        <img src={event.image_url} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        <span className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest mono px-2.5 py-1 rounded-full border ${typeCls}`}>
          {event.event_type}
        </span>
      </div>
      <div className="p-5 flex-1 flex flex-col min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold display leading-snug">{event.title}</h3>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 shrink-0" />
        </div>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{event.description}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4 text-xs text-slate-600 mono">
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {fmt(event.start_time)} · {fmtTime(event.start_time)}</span>
          <span className="inline-flex items-center gap-1.5 truncate"><MapPin className="h-3.5 w-3.5 shrink-0" /> {event.venue}</span>
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {event.registered_count}/{event.capacity}</span>
          <span className={`inline-flex items-center gap-1.5 justify-self-start px-2 py-0.5 rounded-full ${st.cls} text-[10px] uppercase tracking-wider font-semibold`}>{st.label}</span>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
          <span className="truncate">By {event.organizer_name}</span>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-normal">{event.tags?.[0]}</Badge>
        </div>
      </div>
    </Link>
  );
}
