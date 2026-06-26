export function ContactGlobe() {
  return (
    <div
      aria-hidden
      className="relative h-[220px] w-[220px] md:h-[280px] md:w-[280px]"
    >
      <div className="contact-globe-spin absolute inset-0 rounded-full bg-gradient-to-br from-accent/30 via-emerald-400/20 to-transparent blur-sm" />
      <div className="absolute inset-[8%] rounded-full border border-white/20 bg-gradient-to-br from-emerald-500/40 to-teal-600/30 shadow-[inset_0_0_40px_rgba(16,185,129,0.35)]" />
      <div className="contact-globe-ring absolute inset-[18%] rounded-full border border-dashed border-white/25" />
      <div className="contact-globe-ring-reverse absolute inset-[28%] rounded-full border border-white/15" />
      <div className="absolute left-[22%] top-[35%] h-2 w-2 rounded-full bg-white/90 shadow-[0_0_12px_rgba(255,255,255,0.8)]" />
      <div className="absolute right-[30%] top-[48%] h-1.5 w-1.5 rounded-full bg-emerald-200/90" />
      <div className="absolute bottom-[32%] left-[42%] h-1.5 w-1.5 rounded-full bg-white/70" />
      <div className="absolute inset-[38%] rounded-full bg-gradient-to-tr from-white/10 to-transparent" />
    </div>
  );
}
