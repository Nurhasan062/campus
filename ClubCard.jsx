import { Link } from "react-router-dom";
import { Users, ArrowUpRight, Calendar, Clock, Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

const SAVED_CLUBS_KEY = "campuspulse-saved-clubs";

const CATEGORY_COLORS = {
  Tech: "bg-blue-50 text-blue-700 border-blue-200",
  Arts: "bg-rose-50 text-rose-700 border-rose-200",
  Cultural: "bg-amber-50 text-amber-700 border-amber-200",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Social: "bg-violet-50 text-violet-700 border-violet-200",
  Academic: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function ClubCard({ club, showDetails = false }) {
  const [saved, setSaved] = useState(false);
  const badge = CATEGORY_COLORS[club.category] || "bg-slate-50 text-slate-700 border-slate-200";

  useEffect(() => {
    const savedClubs = JSON.parse(localStorage.getItem(SAVED_CLUBS_KEY) || "[]");
    setSaved(savedClubs.includes(club.id));
  }, [club.id]);

  const toggleSaved = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const savedClubs = JSON.parse(localStorage.getItem(SAVED_CLUBS_KEY) || "[]");
    const next = savedClubs.includes(club.id)
      ? savedClubs.filter((id) => id !== club.id)
      : [...savedClubs, club.id];
    localStorage.setItem(SAVED_CLUBS_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("campuspulse-saved-clubs-changed"));
    setSaved(next.includes(club.id));
  };

  return (
    <div
      data-testid={`club-card-${club.id}`}
      className="card-lift group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col min-w-0"
    >
      <div className="relative h-40 overflow-hidden bg-slate-100">
        <img
          src={club.image_url}
          alt={club.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <span className={`absolute top-3 left-3 text-[10px] font-semibold uppercase tracking-widest mono px-2.5 py-1 rounded-full border ${badge}`}>
          {club.category}
        </span>
        <button type="button" onClick={toggleSaved} aria-label={saved ? `Remove ${club.name} from saved clubs` : `Save ${club.name}`} className="absolute top-3 right-3 h-9 w-9 rounded-full bg-white/90 text-slate-700 flex items-center justify-center shadow-sm hover:bg-white" data-testid={`save-club-${club.id}-button`}>
          {saved ? <BookmarkCheck className="h-4 w-4 text-blue-600" /> : <Bookmark className="h-4 w-4" />}
        </button>
      </div>
      <Link to={`/clubs/${club.id}`} className="p-5 flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold display leading-snug truncate" title={club.name}>{club.name}</h3>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
        <p className="text-sm text-slate-500 mt-1 italic">{club.tagline}</p>
        {showDetails && (
          <>
            <p className="text-sm text-slate-600 mt-3 line-clamp-2">{club.description}</p>
            <div className="inline-flex items-start gap-1.5 text-xs text-slate-500 mt-3 mono">
              <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-2">{club.meeting_schedule}</span>
            </div>
          </>
        )}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {club.tags?.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-600 font-normal">{t}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 mono">
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {club.member_count} members</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Est. {club.founded_year}</span>
        </div>
      </Link>
    </div>
  );
}
