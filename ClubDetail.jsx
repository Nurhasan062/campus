import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Users, Calendar, ShieldCheck, ClipboardList, Clock } from "lucide-react";
import { fetchClub, fetchEvents } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import MembershipForm from "@/components/MembershipForm";
import EventCard from "@/components/EventCard";

export default function ClubDetail() {
  const { id } = useParams();
  const [club, setClub] = useState(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchClub(id).then(setClub);
    fetchEvents({ club_id: id }).then(setEvents);
  }, [id]);

  if (!club) return <div className="text-center py-16 text-slate-500">Loading...</div>;

  return (
    <div className="space-y-8" data-testid={`club-detail-${club.id}`}>
      <Link to="/clubs" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900" data-testid="back-to-clubs">
        <ArrowLeft className="h-4 w-4" /> Back to clubs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6 min-w-0">
          <div className="relative aspect-[16/7] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <img src={club.image_url} alt={club.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="inline-block text-[10px] uppercase tracking-widest mono font-semibold bg-white/20 backdrop-blur px-2.5 py-1 rounded-full">{club.category}</span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold display mt-3">{club.name}</h1>
              <p className="italic text-slate-200 mt-1">{club.tagline}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {club.tags.map((t) => <Badge key={t} variant="secondary" className="bg-slate-100 text-slate-700">{t}</Badge>)}
          </div>

          <Tabs defaultValue="about" className="w-full">
            <TabsList className="bg-slate-100">
              <TabsTrigger value="about" data-testid="tab-about">About</TabsTrigger>
              <TabsTrigger value="eligibility" data-testid="tab-eligibility">Eligibility</TabsTrigger>
              <TabsTrigger value="process" data-testid="tab-process">How to Join</TabsTrigger>
              <TabsTrigger value="events" data-testid="tab-events">Events ({events.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-4 space-y-3">
              <h3 className="font-bold display text-xl">What we're about</h3>
              <p className="text-slate-700 leading-relaxed">{club.description}</p>
              <Separator className="my-4" />
              <div className="flex items-start gap-3 text-slate-700"><Clock className="h-4 w-4 mt-0.5 text-slate-400" /><div><span className="text-xs uppercase tracking-widest mono text-slate-500">Meeting schedule</span><div>{club.meeting_schedule}</div></div></div>
            </TabsContent>
            <TabsContent value="eligibility" className="mt-4 space-y-3">
              <h3 className="font-bold display text-xl inline-flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Who can join</h3>
              <p className="text-slate-700 leading-relaxed">{club.eligibility}</p>
            </TabsContent>
            <TabsContent value="process" className="mt-4 space-y-3">
              <h3 className="font-bold display text-xl inline-flex items-center gap-2"><ClipboardList className="h-5 w-5 text-blue-600" /> Joining process</h3>
              <p className="text-slate-700 leading-relaxed">{club.membership_process}</p>
            </TabsContent>
            <TabsContent value="events" className="mt-4 space-y-3">
              <h3 className="font-bold display text-xl">Upcoming from {club.name}</h3>
              {events.length === 0 ? (
                <p className="text-slate-500">No upcoming events posted yet — check back soon.</p>
              ) : (
                <div className="space-y-3">
                  {events.map((e) => <EventCard key={e.id} event={e} />)}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">Interested?</div>
              <h3 className="font-bold display text-xl mt-1">Send an interest note</h3>
              <p className="text-sm text-slate-600 mt-1 mb-4">The leads will reach out at your email with next steps — often the same week.</p>
              <MembershipForm club={club} />
              <Separator className="my-5" />
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2 text-slate-600"><Users className="h-4 w-4 text-slate-400" /><span className="mono text-xs">{club.member_count} members</span></li>
                <li className="flex items-center gap-2 text-slate-600"><Calendar className="h-4 w-4 text-slate-400" /><span className="mono text-xs">Est. {club.founded_year}</span></li>
                <li className="flex items-center gap-2 text-slate-600"><Mail className="h-4 w-4 text-slate-400" /><a href={`mailto:${club.contact_email}`} className="mono text-xs hover:text-blue-600">{club.contact_email}</a></li>
              </ul>
            </div>
            <div className="bg-slate-900 text-white rounded-2xl p-6">
              <div className="text-[10px] uppercase tracking-widest mono text-slate-400 font-semibold">Club Lead</div>
              <div className="font-bold display text-lg mt-1">{club.lead_name}</div>
              <div className="text-sm text-slate-300 mt-1">Reach out via the interest form or email.</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
