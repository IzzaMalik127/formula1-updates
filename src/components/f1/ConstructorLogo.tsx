import { useState } from "react";
import type { Constructor } from "@/lib/f1-data";

/**
 * Uniform team logo tile. Every logo asset is pre-normalized to a 512x512
 * white rounded tile with identical padding, so all teams render at exactly
 * the same shape and size across the app.
 */
export function ConstructorLogo({ c, size = 40 }: { c: Pick<Constructor, "color" | "logo" | "name">; size?: number }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-[22%] ring-1 ring-white/10"
      style={{ width: size, height: size, boxShadow: `0 2px 10px ${c.color}22` }}
    >
      {c.logo && !errored ? (
        <img
          src={c.logo}
          alt={`${c.name} logo`}
          width={size}
          height={size}
          className="h-full w-full object-contain"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="h-full w-full" style={{ background: `linear-gradient(135deg, ${c.color}, ${c.color}88)` }} />
      )}
    </div>
  );
}
