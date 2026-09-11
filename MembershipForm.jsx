import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { postMembership } from "@/lib/api";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

export default function MembershipForm({ club, trigger }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", department: "", academic_year: "First Year", motivation: "", experience_level: "beginner",
  });

  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.department || !form.motivation) {
      toast.error("Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      await postMembership({ club_id: club.id, ...form });
      toast.success(`Interest sent to ${club.name}!`, { description: "They'll reach out at your email shortly." });
      setOpen(false);
      setForm({ name: "", email: "", department: "", academic_year: "First Year", motivation: "", experience_level: "beginner" });
    } catch (err) {
      toast.error("Could not submit — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-600 hover:bg-blue-700 w-full" data-testid={`join-club-${club.id}-button`}>
            <UserPlus className="h-4 w-4 mr-2" /> Express Interest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-lg" data-testid="membership-form-dialog">
        <DialogHeader>
          <DialogTitle className="display text-2xl">Join {club.name}</DialogTitle>
          <DialogDescription>Tell the club leads a little about you. All fields marked * are required.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="m-name">Full name *</Label>
              <Input id="m-name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ananya Kapoor" data-testid="membership-name-input" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="m-email">Campus email *</Label>
              <Input id="m-email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="you@campus.edu" data-testid="membership-email-input" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="m-dept">Department *</Label>
              <Input id="m-dept" value={form.department} onChange={(e) => set("department", e.target.value)} placeholder="Computer Science" data-testid="membership-department-input" />
            </div>
            <div className="space-y-2">
              <Label>Academic year *</Label>
              <Select value={form.academic_year} onValueChange={(v) => set("academic_year", v)}>
                <SelectTrigger data-testid="membership-year-select"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-white">
                  {["First Year","Second Year","Third Year","Fourth Year","Postgraduate"].map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Experience level</Label>
            <Select value={form.experience_level} onValueChange={(v) => set("experience_level", v)}>
              <SelectTrigger data-testid="membership-experience-select"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="beginner">Beginner — new to this</SelectItem>
                <SelectItem value="intermediate">Intermediate — dabbled a bit</SelectItem>
                <SelectItem value="advanced">Advanced — bring on the deep end</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-mot">Why do you want to join? *</Label>
            <Textarea id="m-mot" rows={4} value={form.motivation} onChange={(e) => set("motivation", e.target.value)} placeholder="A sentence or two on what pulls you in..." data-testid="membership-motivation-input" />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full bg-slate-900 hover:bg-slate-800" data-testid="membership-form-submit-button">
              {loading ? "Sending..." : "Send Interest"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
