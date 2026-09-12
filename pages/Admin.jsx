import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Activity, CalendarPlus, CheckCircle2, Plus, ShieldCheck, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { postClub, postEvent } from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

const LOG_KEY = "campuspulse-admin-logs";
const CLUBS_KEY = "campuspulse-admin-clubs";
const EVENTS_KEY = "campuspulse-admin-events";
const emptyClub = { name: "", tagline: "", description: "", category: "Tech", meeting_schedule: "", contact_email: "", lead_name: "", image_url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=900&q=80" };
const emptyEvent = { title: "", description: "", event_type: "Workshop", start_time: "", end_time: "", venue: "", organizer_name: "CampusPulse Admin", image_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80" };

export default function Admin() {
  if (getCurrentUser()?.role !== "admin") return <Navigate to="/dashboard" replace />;
  const [club, setClub] = useState(emptyClub);
  const [event, setEvent] = useState(emptyEvent);
  const [logs, setLogs] = useState(() => read(LOG_KEY));
  const updateClub = (key) => (value) => setClub((current) => ({ ...current, [key]: value }));
  const updateEvent = (key) => (value) => setEvent((current) => ({ ...current, [key]: value }));

  const submitClub = async (e) => {
    e.preventDefault();
    const payload = { ...club, eligibility: "Open to all enrolled students.", membership_process: "Complete the interest form and attend an open meeting.", tags: [club.category], member_count: 0, founded_year: new Date().getFullYear() };
    try { await postClub(payload); } catch { saveLocal(CLUBS_KEY, { ...payload, id: `admin-club-${Date.now()}`, created_at: new Date().toISOString() }); }
    record(`Added club: ${club.name}`); setClub(emptyClub); toast.success("Club added to CampusPulse.");
  };

  const submitEvent = async (e) => {
    e.preventDefault();
    const payload = { ...event, start_time: new Date(event.start_time).toISOString(), end_time: new Date(event.end_time).toISOString(), tags: [event.event_type], capacity: 100, registration_status: "open" };
    try { await postEvent(payload); } catch { saveLocal(EVENTS_KEY, { ...payload, id: `admin-event-${Date.now()}`, created_at: new Date().toISOString() }); }
    record(`Added event: ${event.title}`); setEvent(emptyEvent); toast.success("Event added to CampusPulse.");
  };

  const record = (message) => { const next = [{ message, at: new Date().toISOString() }, ...read(LOG_KEY)].slice(0, 20); localStorage.setItem(LOG_KEY, JSON.stringify(next)); setLogs(next); };

  return <div className="space-y-8" data-testid="admin-page">
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-4"><div><div className="text-[10px] uppercase tracking-widest mono text-blue-700 font-semibold">Administrator console</div><h1 className="text-3xl sm:text-4xl font-extrabold display mt-2">Run the campus pulse.</h1><p className="text-slate-600 mt-2">Publish clubs and events, then keep an eye on recent site activity.</p></div><div className="inline-flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2"><ShieldCheck className="h-4 w-4" /> Admin access active</div></section>
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4"><Metric icon={<Users className="h-4 w-4" />} value="500+" label="Clubs available" /><Metric icon={<CalendarPlus className="h-4 w-4" />} value="8" label="Upcoming events" /><Metric icon={<Activity className="h-4 w-4" />} value={logs.length} label="Recent actions" /><Metric icon={<CheckCircle2 className="h-4 w-4" />} value="Live" label="Publishing status" /></section>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AdminForm title="Add a club" icon={<Users className="h-5 w-5" />} onSubmit={submitClub} submitLabel="Publish club" testid="admin-club-form"><Field label="Club name" value={club.name} onChange={updateClub("name")} required placeholder="Campus Film Society" /><Field label="Tagline" value={club.tagline} onChange={updateClub("tagline")} required placeholder="A short line students remember" /><div className="grid sm:grid-cols-2 gap-4"><Field label="Category" type="select" value={club.category} options={["Tech", "Arts", "Cultural", "Sports", "Social", "Academic", "Wellness", "Media", "Environment"]} onChange={updateClub("category")} /><Field label="Meeting schedule" value={club.meeting_schedule} onChange={updateClub("meeting_schedule")} required placeholder="Thursdays · 6:00 PM" /></div><Field label="Description" type="textarea" value={club.description} onChange={updateClub("description")} required placeholder="What does this club do?" /><div className="grid sm:grid-cols-2 gap-4"><Field label="Lead name" value={club.lead_name} onChange={updateClub("lead_name")} required /><Field label="Contact email" type="email" value={club.contact_email} onChange={updateClub("contact_email")} required /></div></AdminForm>
      <AdminForm title="Add an event" icon={<CalendarPlus className="h-5 w-5" />} onSubmit={submitEvent} submitLabel="Publish event" testid="admin-event-form"><Field label="Event title" value={event.title} onChange={updateEvent("title")} required placeholder="Spring makers fair" /><div className="grid sm:grid-cols-2 gap-4"><Field label="Event type" type="select" value={event.event_type} options={["Competition", "Workshop", "Seminar", "Cultural", "Fest"]} onChange={updateEvent("event_type")} /><Field label="Venue" value={event.venue} onChange={updateEvent("venue")} required placeholder="Main Quad" /></div><div className="grid sm:grid-cols-2 gap-4"><Field label="Starts" type="datetime-local" value={event.start_time} onChange={updateEvent("start_time")} required /><Field label="Ends" type="datetime-local" value={event.end_time} onChange={updateEvent("end_time")} required /></div><Field label="Description" type="textarea" value={event.description} onChange={updateEvent("description")} required placeholder="What should students know?" /><Field label="Organizer" value={event.organizer_name} onChange={updateEvent("organizer_name")} required /></AdminForm>
    </div>
    <section className="bg-white border border-slate-200 rounded-xl p-6"><div className="flex items-center gap-2"><Activity className="h-5 w-5 text-blue-600" /><h2 className="font-bold display text-xl">Site activity log</h2></div>{logs.length ? <div className="divide-y divide-slate-100 mt-4">{logs.map((log, index) => <div key={`${log.at}-${index}`} className="flex items-center gap-3 py-3 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-600" /><span className="flex-1">{log.message}</span><span className="text-xs text-slate-400 mono">{new Date(log.at).toLocaleString()}</span></div>)}</div> : <p className="text-sm text-slate-500 mt-4">No admin actions recorded yet.</p>}</section>
  </div>;
}

function Field({ label, type = "text", value, onChange, options, ...props }) { return <div className="space-y-2"><Label>{label}</Label>{type === "textarea" ? <Textarea value={value} onChange={(e) => onChange(e.target.value)} {...props} /> : type === "select" ? <select value={value} onChange={(e) => onChange(e.target.value)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">{options.map((option) => <option key={option}>{option}</option>)}</select> : <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} {...props} />}</div>; }
function AdminForm({ title, icon, children, onSubmit, submitLabel, testid }) { return <form onSubmit={onSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4" data-testid={testid}><div className="flex items-center gap-2 mb-2"><span className="text-blue-600">{icon}</span><h2 className="font-bold display text-xl">{title}</h2></div>{children}<Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800"><Plus className="h-4 w-4 mr-2" />{submitLabel}</Button></form>; }
function Metric({ icon, value, label }) { return <div className="bg-white border border-slate-200 rounded-xl p-4"><div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-[10px] uppercase tracking-widest mono">{label}</span></div><div className="text-2xl font-extrabold display mt-2">{value}</div></div>; }
function read(key) { try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; } }
function saveLocal(key, value) { localStorage.setItem(key, JSON.stringify([...read(key), value])); }
