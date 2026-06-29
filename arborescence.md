# Arborescence du projet Cylentic

> Généré à partir de la structure du dépôt.  
> Exclus : `node_modules/`, `.next/`, `.git/`, client Prisma généré (`app/generated/prisma/`).

```
cylentic/
├── AGENTS.md
├── ARCHITECTURE.md
├── CLAUDE.md
├── Cylentic_Reference_Projet_Finale.md
├── README.md
├── arborescence.md
├── db.md
├── db.sql
├── eslint.config.mjs
├── logo_cylentic.png
├── middleware.ts
├── next.config.ts
├── next-env.d.ts
├── package.json
├── package-lock.json
├── photo_exemple.jpeg
├── postcss.config.mjs
├── prisma.config.ts
├── tsconfig.json
├── .env
├── .env.example
├── .gitignore
│
├── app/                                    # App Router Next.js
│   ├── layout.tsx
│   ├── globals.css
│   ├── favicon.ico
│   ├── generated/
│   │   └── prisma/                       # Client Prisma généré (auto)
│   │
│   ├── (public)/                           # Pages publiques
│   │   ├── page.tsx                        # Landing page
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── establishment/
│   │           └── page.tsx
│   │
│   ├── (auth)/                             # Pages authentifiées
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── onboarding/page.tsx
│   │   │   ├── classes/page.tsx
│   │   │   ├── academic-years/page.tsx
│   │   │   ├── students/page.tsx
│   │   │   ├── teachers/page.tsx
│   │   │   ├── admins/page.tsx
│   │   │   ├── activity-logs/page.tsx
│   │   │   └── subscription/page.tsx
│   │   │
│   │   ├── teacher/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   └── exams/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [examId]/
│   │   │           ├── page.tsx
│   │   │           ├── edit/page.tsx
│   │   │           ├── live/page.tsx
│   │   │           ├── presentation/page.tsx
│   │   │           ├── results/
│   │   │           │   ├── page.tsx
│   │   │           │   └── [participationId]/page.tsx
│   │   │           └── exercises/
│   │   │               └── [exerciseId]/
│   │   │                   └── edit/page.tsx
│   │   │
│   │   ├── student/
│   │   │   ├── change-password/page.tsx
│   │   │   └── exam/
│   │   │       ├── compose/page.tsx
│   │   │       ├── security/page.tsx
│   │   │       ├── waiting/page.tsx
│   │   │       └── submitted/page.tsx
│   │   │
│   │   ├── super-admin/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── establishments/page.tsx
│   │   │   ├── plans/page.tsx
│   │   │   └── feedbacks/page.tsx
│   │   │
│   │   └── proctor/
│   │       └── register/page.tsx
│   │
│   └── api/                                # Routes API
│       ├── academic-years/route.ts
│       ├── auth/
│       │   ├── activate/route.ts
│       │   ├── change-password/route.ts
│       │   ├── login/route.ts
│       │   └── logout/route.ts
│       ├── billing/
│       │   ├── subscription/route.ts
│       │   └── webhook/route.ts
│       ├── classes/route.ts
│       ├── establishments/route.ts
│       ├── exams/
│       │   ├── route.ts
│       │   └── [examId]/
│       │       ├── route.ts
│       │       ├── duplicate/route.ts
│       │       ├── publish/route.ts
│       │       ├── live/route.ts
│       │       ├── exercises/
│       │       │   ├── route.ts
│       │       │   └── [exerciseId]/route.ts
│       │       └── results/
│       │           ├── route.ts
│       │           └── [participationId]/route.ts
│       ├── exam-session/
│       │   ├── join/route.ts
│       │   ├── autosave/route.ts
│       │   ├── execute/route.ts
│       │   ├── submit/route.ts
│       │   └── incidents/route.ts
│       ├── exports/
│       │   ├── attendance/route.ts
│       │   └── results/route.ts
│       ├── grading/route.ts
│       ├── notifications/route.ts
│       ├── onboarding/route.ts
│       ├── super-admin/
│       │   ├── establishments/route.ts
│       │   └── plans/route.ts
│       ├── users/
│       │   ├── admins/route.ts
│       │   ├── students/route.ts
│       │   ├── teachers/route.ts
│       │   └── import-csv/route.ts
│       └── v1/
│           └── exams/route.ts
│
├── components/
│   ├── admin/
│   │   ├── dashboard/
│   │   │   └── admin-dashboard-panels.tsx
│   │   ├── academic-year-form.tsx
│   │   ├── activity-log-table.tsx
│   │   ├── class-form.tsx
│   │   ├── csv-import-dialog.tsx
│   │   ├── plan-selector.tsx
│   │   ├── promotion-wizard.tsx
│   │   ├── stats-cards.tsx
│   │   ├── student-form.tsx
│   │   ├── student-table.tsx
│   │   ├── subscription-panel.tsx
│   │   └── teacher-form.tsx
│   │
│   ├── auth/
│   │   ├── change-password-form.tsx
│   │   ├── establishment-register-form.tsx
│   │   └── login-form.tsx
│   │
│   ├── exam/
│   │   ├── participation-status.tsx
│   │   └── status-badge.tsx
│   │
│   ├── landing/
│   │   ├── contact-globe.tsx
│   │   ├── landing-capabilities.tsx
│   │   ├── landing-contact.tsx
│   │   ├── landing-faq.tsx
│   │   ├── landing-features.tsx
│   │   ├── landing-footer.tsx
│   │   ├── landing-header.tsx
│   │   ├── landing-hero.tsx
│   │   ├── landing-pricing.tsx
│   │   ├── landing-team.tsx
│   │   └── landing-testimonials.tsx
│   │
│   ├── layout/
│   │   ├── dashboard-nav.tsx
│   │   ├── dashboard-shell.tsx
│   │   ├── header.tsx
│   │   └── sidebar.tsx
│   │
│   ├── onboarding/
│   │   ├── onboarding-checklist.tsx
│   │   └── onboarding-wizard.tsx
│   │
│   ├── proctor/
│   │   └── room-register.tsx
│   │
│   ├── shared/
│   │   ├── confirm-dialog.tsx
│   │   ├── data-table.tsx
│   │   ├── empty-state.tsx
│   │   ├── loading-spinner.tsx
│   │   └── logo.tsx
│   │
│   ├── student/
│   │   ├── code-editor.tsx
│   │   ├── exam-compose-room.tsx
│   │   ├── exam-security-consent.tsx
│   │   ├── exam-timer.tsx
│   │   ├── exercise-nav.tsx
│   │   ├── exercise-statement.tsx
│   │   ├── fullscreen-lock-overlay.tsx
│   │   ├── qcm-exercise-panel.tsx
│   │   ├── qcm-question.tsx
│   │   ├── submit-confirm-dialog.tsx
│   │   ├── submitted-message.tsx
│   │   └── waiting-room.tsx
│   │
│   ├── super-admin/
│   │   ├── dashboard/
│   │   │   └── super-admin-dashboard-panels.tsx
│   │   ├── establishment-table.tsx
│   │   ├── global-stats.tsx
│   │   └── plan-editor.tsx
│   │
│   ├── teacher/
│   │   ├── dashboard/
│   │   │   ├── teacher-charts.tsx
│   │   │   └── teacher-dashboard-panels.tsx
│   │   ├── access-code-display.tsx
│   │   ├── delete-exam-button.tsx
│   │   ├── delete-exercise-button.tsx
│   │   ├── exam-form.tsx
│   │   ├── exam-list.tsx
│   │   ├── exercise-code-form.tsx
│   │   ├── exercise-composer.tsx
│   │   ├── exercise-form-section.tsx
│   │   ├── exercise-list.tsx
│   │   ├── exercise-qcm-form.tsx
│   │   ├── export-buttons.tsx
│   │   ├── incident-timeline.tsx
│   │   ├── live-monitor.tsx
│   │   ├── manual-score-form.tsx
│   │   ├── presentation-mode.tsx
│   │   ├── results-table.tsx
│   │   ├── submission-review.tsx
│   │   └── unit-test-editor.tsx
│   │
│   ├── theme/
│   │   ├── theme-provider.tsx
│   │   ├── theme-script.tsx
│   │   └── theme-toggle.tsx
│   │
│   └── ui/                                 # Design system
│       ├── accordion.tsx
│       ├── alert.tsx
│       ├── avatar.tsx
│       ├── badge.tsx
│       ├── border-beam.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── countdown.tsx
│       ├── dialog.tsx
│       ├── index.ts
│       ├── input.tsx
│       ├── label.tsx
│       ├── pulse-card.tsx
│       ├── select.tsx
│       ├── sparkles.tsx
│       ├── spotlight.tsx
│       ├── table.tsx
│       ├── tabs.tsx
│       └── textarea.tsx
│
├── design-template/                        # Maquettes UI de référence
│   ├── charts_template.png
│   ├── dashboard_template_1.png
│   ├── dashboard_template_2.png
│   ├── dashboard_template_3.1.png
│   ├── dashboard_template_4.png
│   ├── dashboard_template_5.png
│   ├── design_template.png
│   └── design_template_3.2.png
│
├── docker/
│   ├── docker-compose.yml
│   ├── redis/
│   │   └── .gitkeep
│   └── sandbox/
│       └── Dockerfile
│
├── hooks/
│   ├── use-auth.ts
│   ├── use-autosave.ts
│   ├── use-exam-timer.ts
│   ├── realtime/
│   │   └── use-exam-live.ts
│   └── security/
│       ├── use-clipboard-guard.ts
│       ├── use-fullscreen.ts
│       ├── use-keyboard-lock.ts
│       └── use-tab-visibility.ts
│
├── lib/
│   ├── prisma.ts
│   ├── redis.ts
│   ├── admin/
│   │   ├── context.ts
│   │   └── nav.ts
│   ├── auth/
│   │   ├── jwt.ts
│   │   ├── password.ts
│   │   ├── roles.ts
│   │   └── session.ts
│   ├── constants/
│   │   ├── exam.ts
│   │   ├── incidents.ts
│   │   ├── languages.ts
│   │   ├── onboarding.ts
│   │   └── plans.ts
│   ├── navigation/
│   │   └── nav-types.ts
│   ├── repositories/
│   │   ├── establishment.repository.ts
│   │   ├── exam.repository.ts
│   │   ├── participation.repository.ts
│   │   └── user.repository.ts
│   ├── services/
│   │   ├── index.ts
│   │   ├── admin-dashboard.service.ts
│   │   ├── auth.service.ts
│   │   ├── billing.service.ts
│   │   ├── class.service.ts
│   │   ├── establishment.service.ts
│   │   ├── exam.service.ts
│   │   ├── export.service.ts
│   │   ├── grading.service.ts
│   │   ├── notification.service.ts
│   │   ├── onboarding.service.ts
│   │   ├── participation.service.ts
│   │   ├── results.service.ts
│   │   ├── sandbox.service.ts
│   │   ├── security.service.ts
│   │   ├── super-admin.service.ts
│   │   ├── teacher-dashboard.service.ts
│   │   └── user.service.ts
│   ├── super-admin/
│   │   ├── context.ts
│   │   └── nav.ts
│   ├── teacher/
│   │   └── nav.ts
│   ├── theme/
│   │   └── constants.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── exam.ts
│   │   └── onboarding.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── cn.ts
│   │   ├── csv.ts
│   │   ├── dates.ts
│   │   ├── exam-code.ts
│   │   └── identifier.ts
│   └── validators/
│       ├── auth.schema.ts
│       ├── billing.schema.ts
│       ├── establishment.schema.ts
│       ├── exam.schema.ts
│       ├── exercise.schema.ts
│       └── user.schema.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   ├── seed-users.ts
│   └── migrations/
│       ├── migration_lock.toml
│       └── 20260624094232_init/
│           └── migration.sql
│
├── public/
│   ├── assets/
│   │   ├── logo_cylentic.png
│   │   └── team/
│   │       └── member-default.png
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
│
├── scripts/
│   ├── check-db-users.ts
│   ├── reset-demo-passwords.ts
│   └── scaffold-files.mjs
│
└── workers/
    ├── exam-status.worker.ts
    └── grading.worker.ts
```

## Résumé par zone

| Zone | Rôle |
|------|------|
| `app/(public)/` | Landing, login, inscription établissement |
| `app/(auth)/admin/` | Dashboard et gestion établissement |
| `app/(auth)/teacher/` | Dashboard, examens, résultats, suivi live |
| `app/(auth)/student/` | Passation d'examen (salle d'attente, compose, QCM) |
| `app/(auth)/super-admin/` | Administration plateforme globale |
| `app/api/` | API REST (auth, examens, session, billing, exports…) |
| `components/` | Composants React par rôle et UI partagée |
| `lib/services/` | Logique métier |
| `lib/validators/` | Schémas Zod |
| `prisma/` | Schéma BDD et migrations |
| `hooks/` | Hooks React (auth, sécurité, temps réel) |
| `workers/` | Tâches asynchrones (correction, statut examen) |
| `docker/` | Environnement local (Redis, sandbox) |
| `design-template/` | Maquettes visuelles de référence |
