import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { F1Logo } from "./F1Logo";

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "Drivers", to: "/drivers" },
  { label: "Constructors", to: "/constructors" },
  { label: "Circuits", to: "/circuits" },
] as const;

const ABOUT_LINKS = [
  { label: "News", to: "/news" },
  { label: "Calendar", to: "/calendar" },
  { label: "Statistics", to: "/statistics" },
  { label: "Teams", to: "/constructors" },
] as const;

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  return (
    <footer className="relative mt-16 border-t border-white/5">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="container-f1 grid gap-8 py-10 md:grid-cols-4">
        <div>
          <F1Logo />
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Formula One World Championship Limited
          </p>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">QUICK LINKS</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {QUICK_LINKS.map((x) => (
              <li key={x.label}>
                <Link to={x.to} className="transition hover:text-foreground">{x.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">ABOUT</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {ABOUT_LINKS.map((x) => (
              <li key={x.label}>
                <Link to={x.to} className="transition hover:text-foreground">{x.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">STAY IN THE PULSE</h5>
          <p className="mt-4 text-xs text-muted-foreground">Subscribe for the latest F1 updates</p>
          {subscribed ? (
            <div className="mt-3 flex items-center gap-2 rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-xs text-foreground">
              <Check className="h-4 w-4 text-primary" />
              You're subscribed. Lights out and away we go.
            </div>
          ) : (
            <form
              className="mt-3 flex overflow-hidden rounded-md border border-white/10 bg-white/[0.03]"
              onSubmit={(e) => {
                e.preventDefault();
                if (!email.trim()) return;
                setSubscribed(true);
              }}
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button type="submit" className="grid w-10 place-items-center bg-primary text-primary-foreground transition hover:brightness-110" aria-label="Subscribe">
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </footer>
  );
}
