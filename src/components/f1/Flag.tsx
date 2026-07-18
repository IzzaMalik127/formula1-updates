export function Flag({ cc, className = "" }: { cc?: string; className?: string }) {
  if (!cc) return <div className={`bg-white/10 ${className}`} />;
  return (
    <img
      src={`https://flagcdn.com/w80/${cc}.png`}
      srcSet={`https://flagcdn.com/w80/${cc}.png 1x, https://flagcdn.com/w160/${cc}.png 2x`}
      alt={`${cc.toUpperCase()} flag`}
      className={`object-cover ${className}`}
      loading="lazy"
    />
  );
}
