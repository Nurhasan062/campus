import { Link } from "react-router-dom";
import { Users, ArrowUpRight, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const CATEGORY_COLORS = {
  Tech: "bg-blue-50 text-blue-700 border-blue-200",
  Arts: "bg-rose-50 text-rose-700 border-rose-200",
  Cultural: "bg-amber-50 text-amber-700 border-amber-200",
  Sports: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Social: "bg-violet-50 text-violet-700 border-violet-200",
  Academic: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function ClubCard({ club }) {
  const badge = CATEGORY_COLORS[club.category] || "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <Link
      to={`/clubs/${club.id}`}
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
      </div>
      <div className="p-5 flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold display leading-snug truncate" title={club.name}>{club.name}</h3>
          <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-slate-900 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform shrink-0" />
        </div>
        <p className="text-sm text-slate-500 mt-1 italic">{club.tagline}</p>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {club.tags?.slice(0, 3).map((t) => (
            <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-600 font-normal">{t}</Badge>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-4 pt-4 border-t border-slate-100 mono">
          <span className="inline-flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {club.member_count} members</span>
          <span className="inline-flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Est. {club.founded_year}</span>
        </div>
      </div>
    </Link>
  );
}
