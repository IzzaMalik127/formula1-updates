import { useState } from "react";
import type { Driver } from "@/lib/f1-data";

export function DriverPortrait({ d, size = 44 }: { d: Pick<Driver, "color" | "headshot" | "fullName">; size?: number }) {
  const [errored, setErrored] = useState(false);
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full ring-2"
      style={{
        width: size,
        height: size,
        boxShadow: `0 0 0 1px ${d.color}55, 0 6px 18px ${d.color}22`,
        // @ts-expect-error CSS var
        "--tw-ring-color": `${d.color}66`,
        background: `radial-gradient(circle at 50% 40%, ${d.color}33, transparent 70%)`,
      }}
    >
      {d.headshot && !errored ? (
        <img
          src={d.headshot}
          alt={d.fullName}
          className="absolute inset-0 h-full w-full object-cover object-top"
          loading="lazy"
          onError={() => setErrored(true)}
        />
      ) : (
        <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${d.color}55, ${d.color}22)` }} />
      )}
    </div>
  );
}
