import f1LogoAsset from "@/assets/f1-logo.png";

export function F1Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img
        src={f1LogoAsset}
        alt="Formula 1"
        className="h-6 w-auto md:h-7 select-none"
        draggable={false}
      />
    </div>
  );
}
