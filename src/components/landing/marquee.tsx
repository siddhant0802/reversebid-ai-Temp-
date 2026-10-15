export function LogosMarquee() {
  const logos = ["Acme Corp", "Vertex", "Northwind", "Globex", "Initech", "Umbrella", "Hooli", "Massive Dynamic", "Stark Industries", "Wonka Co"];
  return (
    <div className="relative overflow-hidden py-4 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <div className="flex gap-16 animate-[marquee_35s_linear_infinite] w-max">
        {[...logos, ...logos].map((n, i) => (
          <div key={i} className="text-xl font-semibold tracking-tight text-muted-foreground/70 whitespace-nowrap">
            {n}
          </div>
        ))}
      </div>
      <style>{`@keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}