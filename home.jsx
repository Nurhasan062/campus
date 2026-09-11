import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Users, Calendar, GraduationCap, Award, Search, Sparkles } from "lucide-react";
import { fetchStats, fetchClubs, fetchEvents, fetchAnnouncements } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AnnouncementTicker from "@/components/AnnouncementTicker";
import ClubCard from "@/components/ClubCard";
import EventCard from "@/components/EventCard";

const CATEGORIES = ["Tech", "Arts", "Cultural", "Sports", "Social", "Academic"];

export default function Home() {
  const [stats, setStats] = useState({ total_clubs: 0, upcoming_events: 0, weekly_workshops: 0, active_members: 0 });
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [annos, setAnnos] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetchStats().then(setStats).catch(() => {});
    fetchClubs().then((d) => setClubs(d.slice(0, 6))).catch(() => {});
    fetchEvents().then((d) => setEvents(d.slice(0, 3))).catch(() => {});
    fetchAnnouncements().then((d) => setAnnos(d.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <div className="space-y-16" data-testid="home-page">
      {/* Hero */}
      <section className="relative -mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-14 grain">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-6">
              <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border border-blue-200 rounded-full mono text-[10px] uppercase tracking-widest">
                <Sparkles className="h-3 w-3 mr-1.5" /> One roof for campus life
              </Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold display leading-[1.05] tracking-tight">
                Find your <span className="text-blue-600">people</span>,<br />
                catch every <span className="italic text-slate-500 font-serif">happening</span>.
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                CampusPulse is where every club, event, competition, and announcement lives — searchable, filterable, and one tap from your RSVP.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search clubs, events, workshops..."
                    className="pl-10 h-12 bg-white border-slate-300"
                    data-testid="hero-search-input"
                  />
                </div>
                <Link to={`/clubs${query ? `?q=${encodeURIComponent(query)}` : ""}`}>
                  <Button className="h-12 px-6 bg-slate-900 hover:bg-slate-800 rounded-lg w-full sm:w-auto" data-testid="hero-search-cta">
                    Explore <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                {CATEGORIES.map((c) => (
                  <Link
                    key={c}
                    to={`/clubs?category=${c}`}
                    data-testid={`hero-category-${c.toLowerCase()}-chip`}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white border border-slate-200 hover:border-slate-900 hover:text-slate-900 text-slate-600 transition-colors"
                  >
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="grid grid-cols-2 gap-4">
                <StatCard icon={<Users className="h-4 w-4" />} value={stats.total_clubs} label="Active clubs" accent="from-blue-500 to-indigo-500" testid="stat-clubs" />
                <StatCard icon={<Calendar className="h-4 w-4" />} value={stats.upcoming_events} label="Upcoming events" accent="from-emerald-500 to-teal-500" testid="stat-events" />
                <StatCard icon={<GraduationCap className="h-4 w-4" />} value={stats.weekly_workshops} label="Workshops on offer" accent="from-amber-500 to-orange-500" testid="stat-workshops" />
                <StatCard icon={<Award className="h-4 w-4" />} value={stats.active_members} label="Active members" accent="from-rose-500 to-pink-500" testid="stat-members" />
              </div>
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 relative aspect-video bg-slate-100">
                <img
                  src="https://images.unsplash.com/photo-1781583847268-46d15bfe5609?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Students collaborating"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <div className="text-[10px] uppercase tracking-widest mono opacity-80">This Week</div>
                  <div className="text-sm font-semibold display">Six new events. Two new clubs. One shared calendar.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <AnnouncementTicker items={annos} />
      </section>

      {/* Featured clubs */}
      <section className="space-y-6" data-testid="featured-clubs-section">
        <SectionHeader eyebrow="Discover" title="Featured clubs this week" cta={{ to: "/clubs", label: "Browse all clubs" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((c) => <ClubCard key={c.id} club={c} showDetails />)}
        </div>
      </section>

      {/* Upcoming events */}
      <section className="space-y-6" data-testid="upcoming-events-section">
        <SectionHeader eyebrow="Coming up" title="Events on the horizon" cta={{ to: "/events", label: "See full calendar" }} />
        <div className="grid grid-cols-1 gap-4">
          {events.map((e) => <EventCard key={e.id} event={e} />)}
        </div>
      </section>

      {/* Announcements teaser */}
      <section className="space-y-6" data-testid="announcements-teaser">
        <SectionHeader eyebrow="Signals" title="Latest from campus" cta={{ to: "/announcements", label: "All announcements" }} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {annos.slice(0, 4).map((a) => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-xl p-5 card-lift" data-testid={`announcement-card-${a.id}`}>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] uppercase tracking-widest mono font-semibold text-indigo-600">{a.category}</span>
                {a.is_pinned && <span className="text-[10px] uppercase tracking-widest mono font-semibold text-amber-600">Pinned</span>}
              </div>
              <h3 className="font-bold display text-lg leading-snug">{a.title}</h3>
              <p className="text-sm text-slate-600 mt-2 line-clamp-2">{a.body}</p>
              <div className="text-xs text-slate-400 mt-3 mono">by {a.posted_by}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, value, label, accent, testid }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 relative overflow-hidden" data-testid={testid}>
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accent}`} />
      <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-[10px] uppercase tracking-widest mono">{label}</span></div>
      <div className="text-3xl font-extrabold display mt-2">{value}</div>
    </div>
  );
}

function SectionHeader({ eyebrow, title, cta }) {
  return (
    <div className="flex items-end justify-between gap-4 flex-wrap">
      <div>
        <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">{eyebrow}</div>
        <h2 className="text-2xl sm:text-3xl font-bold display mt-1">{title}</h2>
      </div>
      {cta && (
        <Link to={cta.to} className="text-sm font-semibold text-slate-900 hover:text-blue-600 inline-flex items-center gap-1.5" data-testid={`section-cta-${cta.to.replace("/","")}`}>
          {cta.label} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
