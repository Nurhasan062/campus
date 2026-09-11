import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, MapPin, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { fetchEvent } from "@/lib/api";
import RSVPForm from "@/components/RSVPForm";

function formatDate(value) {
  return new Date(value).toLocaleString(undefined, { dateStyle: "full", timeStyle: "short" });
}

export default function EventDetail() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchEvent(id).then(setEvent).catch(() => setError(true));
  }, [id]);

  if (error) return <div className="text-center py-16 text-slate-500">Event not found.</div>;
  if (!event) return <div className="text-center py-16 text-slate-500">Loading event...</div>;

  return (
    <div className="space-y-8" data-testid={`event-detail-${event.id}`}>
      <Link to="/events" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900" data-testid="back-to-events">
        <ArrowLeft className="h-4 w-4" /> Back to events
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          <div className="relative aspect-[16/7] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
            <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="text-xs uppercase tracking-widest mono">{event.event_type}</div>
              <h1 className="text-3xl sm:text-4xl font-extrabold display mt-2">{event.title}</h1>
            </div>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed">{event.description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-slate-600">
            <span className="inline-flex items-start gap-2"><Calendar className="h-4 w-4 mt-0.5 text-slate-400" /> {formatDate(event.start_time)}</span>
            <span className="inline-flex items-start gap-2"><MapPin className="h-4 w-4 mt-0.5 text-slate-400" /> {event.venue}</span>
            <span className="inline-flex items-start gap-2"><Users className="h-4 w-4 mt-0.5 text-slate-400" /> {event.registered_count} of {event.capacity} seats taken</span>
          </div>
        </div>
        <aside className="lg:col-span-4">
          <div className="sticky top-24 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">Registration</div>
            <h2 className="font-bold display text-xl">Save your seat</h2>
            <p className="text-sm text-slate-600">Organized by {event.organizer_name}.</p>
            <RSVPForm event={event} />
          </div>
        </aside>
      </div>
    </div>
  );
}
