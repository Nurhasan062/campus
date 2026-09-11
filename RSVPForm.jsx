import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postRSVP } from "@/lib/api";
import { toast } from "sonner";
import { TicketCheck } from "lucide-react";

export default function RSVPForm({ event, trigger, onSuccess }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", department: "", academic_year: "First Year", questions: "",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await postRSVP({ event_id: event.id, ...form });
      toast.success("You're on the list!", { description: `See you at ${event.title}.` });
      setOpen(false);
      setForm({ name: "", email: "", department: "", academic_year: "First Year", questions: "" });
      onSuccess?.();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Could not RSVP — please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const isClosed = event.registration_status === "closed";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 w-full" disabled={isClosed} data-testid={`event-rsvp-${event.id}-button`}>
            <TicketCheck className="h-4 w-4 mr-2" /> {isClosed ? "Registration closed" : "Instant RSVP"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-lg" data-testid="rsvp-form-dialog">
        <DialogHeader>
          <DialogTitle className="display text-2xl">RSVP · {event.title}</DialogTitle>
          <DialogDescription>Confirm your seat. You'll receive a reminder at your email.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="r-name">Full name *</Label>
              <Input id="r-name" value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="rsvp-name-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="r-email">Campus email *</Label>
              <Input id="r-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="rsvp-email-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="r-dept">Department *</Label>
              <Input id="r-dept" value={form.department} onChange={(e) => set("department", e.target.value)} data-testid="rsvp-department-input" />
            </div>
            <div className="space-y-2">
              <Label>Academic year *</Label>
              <Select value={form.academic_year} onValueChange={(v) => set("academic_year", v)}>
                <SelectTrigger data-testid="rsvp-year-select"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {["First Year","Second Year","Third Year","Fourth Year","Postgraduate"].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="r-q">Questions for organizers (optional)</Label>
            <Textarea id="r-q" rows={3} value={form.questions} onChange={(e) => set("questions", e.target.value)} data-testid="rsvp-questions-input" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" data-testid="rsvp-form-submit-button">
              {loading ? "Confirming..." : "Confirm RSVP"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
