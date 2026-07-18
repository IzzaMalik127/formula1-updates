import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { Footer } from "./Footer";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground" style={{ background: "var(--gradient-hero)" }}>
      <TopNav />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
