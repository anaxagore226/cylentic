import Image from "next/image";
import Link from "next/link";

export function Logo({ size = 40 }: { size?: number }) {
  return (
    <Link href="/" className="inline-flex items-center gap-3">
      <Image
        src="/assets/logo_cylentic.png"
        alt="Cylentic"
        width={size}
        height={size}
        className="rounded-lg"
      />
      <span className="text-lg font-semibold tracking-tight">Cylentic</span>
    </Link>
  );
}
