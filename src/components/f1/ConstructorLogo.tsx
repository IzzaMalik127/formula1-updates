import { useState } from "react";
import type { Constructor } from "@/lib/f1-data";

export function ConstructorLogo({ c, size = 40 }: { c: Pick<Constructor, "color" | "logo" | "name">; size?: number }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]"
      style={{ width: size, height: size, boxShadow: `inset 0 0 0 1px ${c.color}33` }}
    >
      {c.logo && !errored ? (
        <img
          src={c.logo}
          alt={`${c.name} logo`}
          style={{ maxWidth: size - 12, maxHeight: size - 12 }}
          className="object-contain"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }} />
      )}
    </div>
  );
}
