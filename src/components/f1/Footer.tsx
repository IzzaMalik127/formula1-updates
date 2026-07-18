import { Instagram, Youtube, Twitter, Music2, ArrowRight } from "lucide-react";
import { F1Logo } from "./F1Logo";

export function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/5">
      <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
      <div className="container-f1 grid gap-8 py-10 md:grid-cols-5">
        <div className="md:col-span-1">
          <F1Logo />
          <p className="mt-4 text-xs text-muted-foreground">
            © {new Date().getFullYear()} Formula One World Championship Limited
          </p>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">QUICK LINKS</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["Home", "Drivers", "Constructors", "Circuits"].map((x) => (
              <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">ABOUT</h5>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            {["News", "Teams", "Calendar", "Regulations"].map((x) => (
              <li key={x}><a href="#" className="hover:text-foreground">{x}</a></li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">CONNECT</h5>
          <div className="mt-4 flex items-center gap-3 text-muted-foreground">
            {[Instagram, Twitter, Youtube, Music2].map((I, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-white/10 transition hover:border-primary hover:text-primary" aria-label="Social">
                <I className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold tracking-widest">STAY IN THE PULSE</h5>
          <p className="mt-4 text-xs text-muted-foreground">Subscribe for the latest F1 updates</p>
          <form className="mt-3 flex overflow-hidden rounded-md border border-white/10 bg-white/[0.03]" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Enter your email" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground" />
            <button className="grid w-10 place-items-center bg-primary text-primary-foreground transition hover:brightness-110" aria-label="Subscribe">
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
