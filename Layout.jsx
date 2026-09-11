import { Outlet, NavLink, Link } from "react-router-dom";
import { Sparkles, Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const nav = [
  { to: "/", label: "Home", end: true, testid: "nav-home-link" },
  { to: "/clubs", label: "Clubs", testid: "nav-clubs-link" },
  { to: "/events", label: "Events", testid: "nav-events-link" },
  { to: "/announcements", label: "Announcements", testid: "nav-announcements-link" },
];

export default function Layout() {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 overflow-x-hidden">
      <header
        className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200/80"
        data-testid="global-header"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group" data-testid="brand-link">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm group-hover:rotate-6 transition-transform">
              <Sparkles className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-extrabold tracking-tight display">CampusPulse</span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 mono">Clubs · Events · Signals</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.end}
                data-testid={n.testid}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "text-blue-700 bg-blue-50" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/clubs" className="hidden md:block">
              <Button className="bg-slate-900 hover:bg-slate-800 rounded-lg" data-testid="header-discover-cta">
                Discover Clubs
              </Button>
            </Link>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" data-testid="mobile-menu-button">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="bg-white w-72">
                <div className="flex flex-col gap-1 mt-8">
                  {nav.map((n) => (
                    <NavLink
                      key={n.to}
                      to={n.to}
                      end={n.end}
                      onClick={() => setOpen(false)}
                      data-testid={`mobile-${n.testid}`}
                      className={({ isActive }) =>
                        `px-4 py-3 rounded-lg text-base font-semibold ${
                          isActive ? "text-blue-700 bg-blue-50" : "text-slate-700 hover:bg-slate-100"
                        }`
                      }
                    >
                      {n.label}
                    </NavLink>
                  ))}
                  <Link to="/clubs" onClick={() => setOpen(false)}>
                    <Button className="w-full mt-4 bg-slate-900 hover:bg-slate-800" data-testid="mobile-discover-cta">
                      Discover Clubs
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 min-w-0">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white mt-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 text-sm text-slate-500 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="font-bold text-slate-900 display text-base">CampusPulse</div>
            <div>The single source for campus clubs, events, and signals.</div>
          </div>
          <div className="mono text-xs uppercase tracking-widest">Built for curious students · 2026</div>
        </div>
      </footer>
    </div>
  );
}
