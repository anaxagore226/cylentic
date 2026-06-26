import { cn } from "@/lib/utils/cn";

interface SparklesProps {
  className?: string;
  color?: string;
}

export function SparklesCore({
  className,
  color = "rgba(16, 185, 129, 0.8)",
}: SparklesProps) {
  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${(i * 17 + 5) % 100}%`,
    top: `${(i * 23 + 10) % 100}%`,
    delay: `${(i % 6) * 0.35}s`,
    size: i % 3 === 0 ? "3px" : "2px",
  }));

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {dots.map((dot) => (
        <span
          key={dot.id}
          className="contact-sparkle absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            backgroundColor: color,
            animationDelay: dot.delay,
          }}
        />
      ))}
    </div>
  );
}
