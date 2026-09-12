import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, CheckCircle2, Eye, EyeOff, Mail, RefreshCw, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser, registerUser } from "@/lib/auth";

function makeCaptcha() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
}

export default function Auth({ mode = "login" }) {
  const isRegister = mode === "register";
  const navigate = useNavigate();
  const location = useLocation();
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [form, setForm] = useState({ name: "", email: "", password: "", captcha: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const passwordHint = useMemo(() => isRegister ? "Use at least 8 characters." : "", [isRegister]);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = (event) => {
    event.preventDefault();
    if (form.captcha.trim().toUpperCase() !== captcha) {
      toast.error("The CAPTCHA code does not match.");
      setCaptcha(makeCaptcha());
      setForm((current) => ({ ...current, captcha: "" }));
      return;
    }
    if (isRegister && form.password.length < 8) {
      toast.error("Your password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    try {
      const user = isRegister ? registerUser(form) : loginUser(form);
      toast.success(isRegister ? "Your account is ready." : "Welcome back.");
      navigate(location.state?.from || "/dashboard");
      return user;
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center py-6" data-testid={`${mode}-page`}>
      <div className="w-full max-w-5xl grid lg:grid-cols-2 bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="hidden lg:flex bg-slate-900 text-white p-10 flex-col justify-between min-h-[620px] relative overflow-hidden">
          <div className="relative z-10 flex items-center gap-2"><div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center"><Sparkles className="h-4 w-4" /></div><span className="font-extrabold display text-lg">CampusPulse</span></div>
          <div className="relative z-10 max-w-sm"><div className="text-[10px] uppercase tracking-widest mono text-blue-300 font-semibold">A better campus rhythm</div><h1 className="text-4xl font-extrabold display mt-3">Find your people. Keep your place.</h1><p className="text-slate-300 mt-4 leading-relaxed">One account for your club shortlist, event plans, and the campus signals worth following.</p></div>
          <div className="relative z-10 text-xs text-slate-400 mono flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> CAPTCHA protected sign in</div>
          <div className="absolute -right-20 -bottom-16 h-72 w-72 rounded-full border-[40px] border-blue-500/20" />
        </div>

        <div className="p-6 sm:p-10">
          <div className="lg:hidden flex items-center gap-2 mb-10"><div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white"><Sparkles className="h-4 w-4" /></div><span className="font-extrabold display text-lg">CampusPulse</span></div>
          <div className="text-[10px] uppercase tracking-widest mono text-slate-500 font-semibold">{isRegister ? "Create your account" : "Welcome back"}</div>
          <h2 className="text-3xl font-extrabold display mt-2">{isRegister ? "Join the pulse." : "Sign in to continue."}</h2>
          <p className="text-sm text-slate-600 mt-2">{isRegister ? "Save clubs, plan your week, and stay in the loop." : "Your campus dashboard is waiting."}</p>

          <form onSubmit={submit} className="space-y-5 mt-8">
            {isRegister && <div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" value={form.name} onChange={update("name")} placeholder="Alex Morgan" autoComplete="name" required data-testid="register-name-input" /></div>}
            <div className="space-y-2"><Label htmlFor="email">Email address</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><Input id="email" type="email" value={form.email} onChange={update("email")} placeholder="you@campus.edu" className="pl-10" autoComplete="email" required data-testid={`${mode}-email-input`} /></div></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><div className="relative"><Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={update("password")} placeholder="Enter your password" className="pr-11" autoComplete={isRegister ? "new-password" : "current-password"} required minLength={isRegister ? 8 : undefined} data-testid={`${mode}-password-input`} /><button type="button" onClick={() => setShowPassword((current) => !current)} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center text-slate-400 hover:text-slate-800" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>{passwordHint && <p className="text-xs text-slate-500">{passwordHint}</p>}</div>
            <div className="space-y-2"><Label htmlFor="captcha">Security check</Label><div className="flex gap-2"><div className="flex-1 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3"><span className="font-bold tracking-[0.3em] text-slate-700 mono select-none" aria-label="CAPTCHA code">{captcha}</span><button type="button" onClick={() => { setCaptcha(makeCaptcha()); setForm((current) => ({ ...current, captcha: "" })); }} className="text-slate-400 hover:text-slate-900" aria-label="Refresh CAPTCHA"><RefreshCw className="h-4 w-4" /></button></div><Input value={form.captcha} onChange={update("captcha")} placeholder="Type code" className="w-32" autoComplete="off" required data-testid={`${mode}-captcha-input`} /></div></div>
            <Button type="submit" disabled={submitting} className="w-full h-11 bg-slate-900 hover:bg-slate-800" data-testid={`${mode}-submit-button`}>{submitting ? "Please wait..." : isRegister ? "Create account" : "Sign in"}<ArrowRight className="h-4 w-4 ml-2" /></Button>
          </form>

          <div className="flex items-center gap-2 text-xs text-slate-500 mt-6"><CheckCircle2 className="h-4 w-4 text-emerald-600" /> Your email is used only for your CampusPulse account.</div>
          <p className="text-sm text-center text-slate-600 mt-8">{isRegister ? "Already have an account?" : "New to CampusPulse?"} <Link to={isRegister ? "/login" : "/register"} className="font-semibold text-blue-700 hover:text-blue-800">{isRegister ? "Sign in" : "Create one"}</Link></p>
          {!isRegister && <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><strong>Admin access:</strong> admin@campuspulse.local · Admin123!</div>}
        </div>
      </div>
    </div>
  );
}
