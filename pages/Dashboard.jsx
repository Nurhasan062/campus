import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookmarkCheck, CalendarDays, Compass, Sparkles, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ClubCard from "@/components/ClubCard";
import { fetchClubs } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

const SAVED_CLUBS_KEY = "campuspulse-saved-clubs";

export default function Dashboard() {
  const [clubs, setClubs] = useState([]);
  const [savedIds, setSavedIds] = useState(() => readSavedIds());
  const [user, setUser] = useState(getCurrentUser);

  useEffect(() => {
    fetchClubs().then(setClubs).catch(() => setClubs([]));
    const syncSaved = () => setSavedIds(readSavedIds());
    const syncUser = () => setUser(getCurrentUser());
    window.addEventListener("campuspulse-saved-clubs-changed", syncSaved);
    window.addEventListener("storage", syncSaved);
    window.addEventListener("campuspulse-auth-changed", syncUser);
    return () => {
      window.removeEventListener("campuspulse-saved-clubs-changed", syncSaved);
      window.removeEventListener("storage", syncSaved);
      window.removeEventListener("campuspulse-auth-changed", syncUser);
    };
  }, []);

  const savedClubs = useMemo(
    () => savedIds.map((id) => clubs.find((club) => club.id === id)).filter(Boolean),
    [clubs, savedIds],
  );

  return (
    <div className="space-y-10" data-testid="dashboard-page">
      <section className="relative overflow-hidden rounded-2xl bg-slate-900 text-white px-6 py-8 sm:px-10 sm:py-10">
        <div className="relative z-10 max-w-2xl">
          <div className="text-[10px] uppercase tracking-widest mono text-blue-300 font-semibold">Your campus, organized</div>
          <h1 className="text-3xl sm:text-4xl font-extrabold display mt-2">Welcome back, {user?.name || "student"}.</h1>
          <p className="text-slate-300 mt-3 max-w-xl">Keep your favorite communities close, discover your next event, and turn curiosity into a calendar.</p>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link to="/clubs"><Button className="bg-white text-slate-900 hover:bg-slate-100"><Compass className="h-4 w-4 mr-2" /> Explore clubs</Button></Link>
            <Link to="/events"><Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800"><CalendarDays className="h-4 w-4 mr-2" /> Browse events</Button></Link>
          </div>
        </div>
        <Sparkles className="absolute -right-4 -bottom-8 h-48 w-48 text-blue-400/15" />
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Dashboard summary">
        <SummaryCard icon={<BookmarkCheck className="h-4 w-4" />} value={savedIds.length} label="Saved clubs" />
        <SummaryCard icon={<Users className="h-4 w-4" />} value="12" label="Campus connections" />
        <SummaryCard icon={<CalendarDays className="h-4 w-4" />} value="3" label="Upcoming this week" />
        <SummaryCard icon={<Sparkles className="h-4 w-4" />} value="6" label="New matches" />
      </section>

      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">Your shortlist</div>
            <h2 className="text-2xl sm:text-3xl font-bold display mt-1">Saved clubs</h2>
          </div>
          <Link to="/clubs" className="text-sm font-semibold inline-flex items-center gap-1.5 hover:text-blue-600">Find more <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {savedClubs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedClubs.slice(0, 3).map((club) => <ClubCard key={club.id} club={club} showDetails />)}
          </div>
        ) : (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 text-center">
            <BookmarkCheck className="h-7 w-7 mx-auto text-slate-400" />
            <h3 className="font-bold display text-xl mt-3">Build your shortlist</h3>
            <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">Save clubs from the directory to keep their details and meeting times one click away.</p>
            <Link to="/clubs"><Button variant="outline" className="mt-5">Browse the directory <ArrowRight className="h-4 w-4 ml-2" /></Button></Link>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">Next up</div>
          <h2 className="font-bold display text-xl mt-1">Your week at a glance</h2>
          <div className="divide-y divide-slate-100 mt-4">
            <ActivityRow day="Tue" title="Design critique night" meta="6:00 PM · Studio 2" />
            <ActivityRow day="Thu" title="Open mic and makers fair" meta="5:30 PM · Main Quad" />
            <ActivityRow day="Sat" title="Community sports day" meta="10:00 AM · Field House" />
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <div className="text-[10px] uppercase tracking-widest mono text-blue-700 font-semibold">A good next step</div>
          <h2 className="font-bold display text-xl mt-1">Try something outside your usual lane.</h2>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">Your saved interests span creative work and technology. Browse Cultural or Environment clubs for a new kind of campus connection.</p>
          <Link to="/clubs?category=Cultural" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 mt-5">Explore a new category <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}

function readSavedIds() {
  try { return JSON.parse(localStorage.getItem(SAVED_CLUBS_KEY) || "[]"); } catch { return []; }
}

function SummaryCard({ icon, value, label }) {
  return <div className="bg-white border border-slate-200 rounded-xl p-4"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-[10px] uppercase tracking-widest mono">{label}</span></div><div className="text-3xl font-extrabold display mt-2">{value}</div></div>;
}

function ActivityRow({ day, title, meta }) {
  return <div className="flex items-center gap-4 py-3"><div className="w-11 text-center"><div className="text-[10px] uppercase mono text-slate-400">{day}</div><CalendarDays className="h-4 w-4 mx-auto mt-1 text-blue-600" /></div><div><div className="font-semibold text-sm">{title}</div><div className="text-xs text-slate-500 mono mt-0.5">{meta}</div></div></div>;
}
