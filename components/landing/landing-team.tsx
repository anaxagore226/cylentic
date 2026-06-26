import Image from "next/image";
import { cn } from "@/lib/utils/cn";

const DEFAULT_TEAM_PHOTO = "/assets/team/member-default.png";

type TeamMember = {
  id: number;
  name: string;
  role: string;
};

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: "Amine Benali",
    role: "Co-fondateur & CEO",
  },
  {
    id: 2,
    name: "Léa Fontaine",
    role: "Co-fondatrice & CTO",
  },
  {
    id: 3,
    name: "Hugo Mercier",
    role: "Responsable produit",
  },
];

export function LandingTeam() {
  return (
    <section id="team" className="border-t border-card-border bg-background py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="hero-fade-in hero-delay-1 mx-auto mb-16 max-w-4xl text-center">
          <h2
            className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
            style={{ color: "var(--foreground)" }}
          >
            Une équipe passionnée par l&apos;éducation et la tech
          </h2>
          <p className="mt-6 text-lg" style={{ color: "var(--muted)" }}>
            Nous combinons expertise pédagogique et ingénierie logicielle pour
            rendre les examens de programmation plus justes, plus simples et
            plus sûrs.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className={cn(
                "group hero-fade-in",
                `hero-delay-${Math.min(index + 2, 6)}`,
              )}
            >
              <div className="relative mb-4 aspect-square overflow-hidden rounded-xl border border-card-border bg-card transition-transform duration-300 ease-in-out group-hover:scale-[1.03]">
                <Image
                  src={DEFAULT_TEAM_PHOTO}
                  alt={member.name}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
              <h3
                className="text-xl font-semibold"
                style={{ color: "var(--foreground)" }}
              >
                {member.name}
              </h3>
              <p className="mt-1 text-base text-accent">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
