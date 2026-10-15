import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative h-8 w-8 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 grid place-items-center overflow-hidden">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]" />
        <span className="relative text-primary-foreground font-bold text-sm">R</span>
      </div>
      <span className="font-semibold tracking-tight text-foreground">
        ReverseHub <span className="gradient-text">AI</span>
      </span>
    </Link>
  );
}