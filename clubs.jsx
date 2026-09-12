import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchClubs } from "@/lib/api";
import ClubCard from "@/components/ClubCard";

const CATEGORIES = ["All", "Tech", "Arts", "Cultural", "Sports", "Social", "Academic", "Wellness", "Entrepreneurship", "Media", "Environment"];
const SORTS = [
  { v: "popular", label: "Most Members" },
  { v: "az", label: "A → Z" },
  { v: "recent", label: "Recently Founded" },
];

export default function Clubs() {
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") || "");
  const [category, setCategory] = useState(params.get("category") || "All");
  const [sort, setSort] = useState("popular");
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchClubs({
      ...(category !== "All" ? { category } : {}),
      ...(query ? { search: query } : {}),
    })
      .then(setClubs)
      .finally(() => setLoading(false));
  }, [category, query]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (query) next.set("q", query);
    if (category && category !== "All") next.set("category", category);
    setParams(next, { replace: true });
    // eslint-disable-next-line
  }, [query, category]);

  const sorted = useMemo(() => {
    const copy = [...clubs];
    if (sort === "popular") copy.sort((a, b) => b.member_count - a.member_count);
    if (sort === "az") copy.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "recent") copy.sort((a, b) => b.founded_year - a.founded_year);
    return copy;
  }, [clubs, sort]);

  const clear = () => { setQuery(""); setCategory("All"); };

  return (
    <div className="space-y-8" data-testid="clubs-page">
      <div className="space-y-3">
        <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">Directory</div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold display tracking-tight">All the clubs, in one place.</h1>
        <p className="text-slate-600 max-w-2xl">Search by interest, filter by category, sort by whatever matters. {sorted.length} club{sorted.length !== 1 && "s"} shown.</p>
      </div>

      <div className="sticky top-16 z-30 backdrop-blur-md bg-white/85 border border-slate-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, tag, or keyword..."
              className="pl-10 h-11 bg-white"
              data-testid="clubs-search-input"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-11 px-3 rounded-md border border-slate-200 bg-white text-sm"
              data-testid="clubs-sort-select"
            >
              {SORTS.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
            </select>
            {(query || category !== "All") && (
              <Button variant="ghost" size="sm" onClick={clear} data-testid="clubs-clear-filters">
                <X className="h-4 w-4 mr-1" /> Clear
              </Button>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              data-testid={`category-filter-${c.toLowerCase()}-button`}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
                category === c
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-900 hover:text-slate-900"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-slate-500" data-testid="clubs-loading">Loading clubs...</div>
      ) : sorted.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-white border border-dashed border-slate-300 rounded-xl" data-testid="clubs-empty-state">
          <div className="text-4xl">🔍</div>
          <h3 className="font-bold display text-xl">No clubs match yet.</h3>
          <p className="text-slate-600">Try a different keyword or category.</p>
          <Button onClick={clear} variant="outline" data-testid="clubs-empty-reset">Reset filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="clubs-grid">
          {sorted.map((c) => <ClubCard key={c.id} club={c} />)}
        </div>
      )}
    </div>
  );
}
