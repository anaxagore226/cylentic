import { writeFileSync, mkdirSync, existsSync } from "fs";
import { dirname, join } from "path";

const root = join(import.meta.dirname, "..");

function write(rel, content) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  if (!existsSync(full)) {
    writeFileSync(full, content, "utf8");
    return true;
  }
  return false;
}

const page = (title, desc = "À implémenter.") => `export default function Page() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold">${title}</h1>
      <p className="mt-2 text-muted-foreground">${desc}</p>
    </main>
  );
}
`;

const layout = (role) => `import type { ReactNode } from "react";

export default function ${role}Layout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen">{children}</div>;
}
`;

const api = (name) => `import { NextResponse } from "next/server";

/** ${name} — squelette API */
export async function GET() {
  return NextResponse.json({ message: "À implémenter" }, { status: 501 });
}

export async function POST() {
  return NextResponse.json({ message: "À implémenter" }, { status: 501 });
}
`;

const component = (name, exportName = name) => `/** ${name} — squelette composant */
export function ${exportName}() {
  return null;
}
`;

const service = (name) => `/** ${name} — squelette service métier */
export const ${name} = {
  // TODO: implémenter
};
`;

const hook = (name) => `/** ${name} — squelette hook */
export function ${name}() {
  return {};
}
`;

const util = (name, body = "// TODO: implémenter") => `/** ${name} */
${body}
`;

const files = [
  // Public pages — move landing to (public)
  ["app/(public)/page.tsx", page("Cylentic", "Plateforme d'examens de programmation sécurisés.")],
  ["app/(public)/login/page.tsx", page("Connexion", "Identifiant, mot de passe et code d'examen (étudiants).")],
  ["app/(public)/register/establishment/page.tsx", page("Créer un espace établissement", "Inscription admin + choix du plan tarifaire.")],

  // Student
  ["app/(auth)/student/change-password/page.tsx", page("Changer le mot de passe")],
  ["app/(auth)/student/exam/security/page.tsx", page("Consignes de sécurité", "Plein écran obligatoire avant l'examen.")],
  ["app/(auth)/student/exam/waiting/page.tsx", page("Salle d'attente", "Compte à rebours avant le début.")],
  ["app/(auth)/student/exam/compose/page.tsx", page("Composition", "IDE Monaco + timer + exercices.")],
  ["app/(auth)/student/exam/submitted/page.tsx", page("Examen soumis", "Confirmation — aucun score affiché.")],

  // Teacher
  ["app/(auth)/teacher/layout.tsx", layout("Teacher")],
  ["app/(auth)/teacher/dashboard/page.tsx", page("Tableau de bord professeur")],
  ["app/(auth)/teacher/exams/page.tsx", page("Mes examens")],
  ["app/(auth)/teacher/exams/new/page.tsx", page("Créer un examen", "Brouillon — pas de code d'accès.")],
  ["app/(auth)/teacher/exams/[examId]/page.tsx", page("Détail de l'examen")],
  ["app/(auth)/teacher/exams/[examId]/edit/page.tsx", page("Modifier l'examen")],
  ["app/(auth)/teacher/exams/[examId]/live/page.tsx", page("Suivi en temps réel")],
  ["app/(auth)/teacher/exams/[examId]/presentation/page.tsx", page("Mode présentation", "Code d'examen en grand format.")],
  ["app/(auth)/teacher/exams/[examId]/results/page.tsx", page("Résultats de l'examen")],
  ["app/(auth)/teacher/exams/[examId]/results/[participationId]/page.tsx", page("Copie étudiant", "Code, tests, incidents, scores.")],

  // Admin
  ["app/(auth)/admin/layout.tsx", layout("Admin")],
  ["app/(auth)/admin/dashboard/page.tsx", page("Tableau de bord administrateur")],
  ["app/(auth)/admin/classes/page.tsx", page("Classes et promotions")],
  ["app/(auth)/admin/academic-years/page.tsx", page("Années académiques")],
  ["app/(auth)/admin/students/page.tsx", page("Étudiants", "Import CSV, saisie manuelle, envoi identifiants.")],
  ["app/(auth)/admin/teachers/page.tsx", page("Professeurs")],
  ["app/(auth)/admin/admins/page.tsx", page("Administrateurs", "Maximum 2 par établissement.")],
  ["app/(auth)/admin/activity-logs/page.tsx", page("Journal d'activité")],
  ["app/(auth)/admin/subscription/page.tsx", page("Abonnement et plan tarifaire")],

  // Super Admin — Phase 1
  ["app/(auth)/super-admin/layout.tsx", layout("SuperAdmin")],
  ["app/(auth)/super-admin/dashboard/page.tsx", page("Super Admin — Tableau de bord global")],
  ["app/(auth)/super-admin/establishments/page.tsx", page("Gestion des établissements", "Phase 1 post-MVP.")],
  ["app/(auth)/super-admin/plans/page.tsx", page("Plans tarifaires", "Phase 1 post-MVP.")],
  ["app/(auth)/super-admin/feedbacks/page.tsx", page("Feedbacks", "Phase 1 post-MVP.")],

  // Proctor — Phase 3
  ["app/(auth)/proctor/register/page.tsx", page("Registre de salle", "Phase 3 — interface surveillant.")],

  // API routes
  ["app/api/auth/login/route.ts", api("POST /api/auth/login")],
  ["app/api/auth/logout/route.ts", api("POST /api/auth/logout")],
  ["app/api/auth/change-password/route.ts", api("POST /api/auth/change-password")],
  ["app/api/auth/activate/route.ts", api("GET/POST /api/auth/activate — Phase 1 token email")],
  ["app/api/establishments/route.ts", api("CRUD établissements")],
  ["app/api/classes/route.ts", api("CRUD classes")],
  ["app/api/academic-years/route.ts", api("CRUD années académiques")],
  ["app/api/users/students/route.ts", api("CRUD étudiants")],
  ["app/api/users/teachers/route.ts", api("CRUD professeurs")],
  ["app/api/users/admins/route.ts", api("CRUD admins établissement")],
  ["app/api/users/import-csv/route.ts", api("POST import CSV étudiants")],
  ["app/api/exams/route.ts", api("Liste / création examens")],
  ["app/api/exams/[examId]/route.ts", api("GET/PATCH/DELETE examen")],
  ["app/api/exams/[examId]/publish/route.ts", api("POST publication + code accès")],
  ["app/api/exams/[examId]/duplicate/route.ts", api("POST duplication examen")],
  ["app/api/exams/[examId]/exercises/route.ts", api("CRUD exercices")],
  ["app/api/exams/[examId]/live/route.ts", api("GET suivi temps réel")],
  ["app/api/exams/[examId]/results/route.ts", api("GET résultats")],
  ["app/api/exam-session/join/route.ts", api("POST connexion étudiant + code")],
  ["app/api/exam-session/autosave/route.ts", api("POST autosave code 30s")],
  ["app/api/exam-session/execute/route.ts", api("POST exécution sandbox")],
  ["app/api/exam-session/submit/route.ts", api("POST soumission examen")],
  ["app/api/exam-session/incidents/route.ts", api("POST journal incidents")],
  ["app/api/grading/route.ts", api("POST correction automatique")],
  ["app/api/notifications/route.ts", api("GET/POST notifications")],
  ["app/api/exports/results/route.ts", api("GET export PDF/Excel — Phase 1")],
  ["app/api/exports/attendance/route.ts", api("GET export présence CSV — Phase 1")],
  ["app/api/billing/webhook/route.ts", api("POST webhook paiement — Phase 2")],
  ["app/api/super-admin/establishments/route.ts", api("Super Admin établissements — Phase 1")],
  ["app/api/super-admin/plans/route.ts", api("Super Admin plans — Phase 1")],
  ["app/api/v1/exams/route.ts", api("API publique Moodle — Phase 3")],
  ["app/api/onboarding/route.ts", api("Onboarding guidé — Phase 2")],

  // Middleware
  ["middleware.ts", util("Middleware auth & protection routes", `import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  // TODO: vérifier JWT, rôle, accès examen
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|assets).*)"],
};
`)],

  // Lib core
  ["lib/prisma.ts", util("Client Prisma", `import { PrismaClient } from "@/app/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`)],
  ["lib/redis.ts", util("Client Redis", `/** Client Redis — sessions, timer serveur */
export async function getRedis() {
  // TODO: connexion ioredis
  return null;
}
`)],

  // Auth
  ["lib/auth/jwt.ts", util("JWT", "export function signToken() { /* TODO */ }\nexport function verifyToken() { /* TODO */ }")],
  ["lib/auth/password.ts", util("Hash mot de passe", "export async function hashPassword() { /* TODO argon2/bcrypt */ }\nexport async function verifyPassword() { /* TODO */ }")],
  ["lib/auth/roles.ts", util("Rôles", `export type UserRole = "admin" | "teacher" | "student" | "super_admin";

export function inferRoleFromIdentifier(identifier: string): UserRole | null {
  if (identifier.startsWith("ETU-")) return "student";
  if (identifier.startsWith("PROF-")) return "teacher";
  if (identifier.startsWith("ADM-")) return "admin";
  return null;
}
`)],
  ["lib/auth/session.ts", util("Session", "export function getSession() { /* TODO */ }")],

  // Validators
  ["lib/validators/auth.schema.ts", util("Zod auth", "export const loginSchema = {};\nexport const changePasswordSchema = {};")],
  ["lib/validators/establishment.schema.ts", util("Zod établissement", "export const createEstablishmentSchema = {};")],
  ["lib/validators/exam.schema.ts", util("Zod examen", "export const createExamSchema = {};\nexport const publishExamSchema = {};")],
  ["lib/validators/user.schema.ts", util("Zod utilisateur", "export const createStudentSchema = {};\nexport const importCsvSchema = {};")],
  ["lib/validators/exercise.schema.ts", util("Zod exercice", "export const createCodeExerciseSchema = {};\nexport const createQcmSchema = {};")],

  // Services
  ["lib/services/auth.service.ts", service("authService")],
  ["lib/services/establishment.service.ts", service("establishmentService")],
  ["lib/services/user.service.ts", service("userService")],
  ["lib/services/exam.service.ts", service("examService")],
  ["lib/services/participation.service.ts", service("participationService")],
  ["lib/services/grading.service.ts", service("gradingService")],
  ["lib/services/sandbox.service.ts", service("sandboxService")],
  ["lib/services/security.service.ts", service("securityService")],
  ["lib/services/notification.service.ts", service("notificationService")],
  ["lib/services/export.service.ts", service("exportService")],
  ["lib/services/billing.service.ts", service("billingService")],
  ["lib/services/super-admin.service.ts", service("superAdminService")],
  ["lib/services/onboarding.service.ts", service("onboardingService")],

  // Repositories
  ["lib/repositories/user.repository.ts", service("userRepository")],
  ["lib/repositories/exam.repository.ts", service("examRepository")],
  ["lib/repositories/participation.repository.ts", service("participationRepository")],
  ["lib/repositories/establishment.repository.ts", service("establishmentRepository")],

  // Utils
  ["lib/utils/identifier.ts", util("Génération identifiants", `export function generateStudentId(acronym: string, year: number, seq: number) {
  return \`ETU-\${acronym}-\${year}-\${String(seq).padStart(4, "0")}\`;
}
export function generateTeacherId(acronym: string, seq: number) {
  return \`PROF-\${acronym}-\${String(seq).padStart(4, "0")}\`;
}
export function generateAdminId(acronym: string, seq: number) {
  return \`ADM-\${acronym}-\${String(seq).padStart(4, "0")}\`;
}
`)],
  ["lib/utils/exam-code.ts", util("Code examen XXXX-XXXX", `const SAFE = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateExamAccessCode(): string {
  const part = () => Array.from({ length: 4 }, () => SAFE[Math.floor(Math.random() * SAFE.length)]).join("");
  return \`\${part()}-\${part()}\`;
}
`)],
  ["lib/utils/dates.ts", util("Dates & fuseaux", "export function toEstablishmentTime() { /* TODO */ }")],
  ["lib/utils/csv.ts", util("Parse CSV étudiants", "export function parseStudentCsv() { /* TODO */ }")],

  // Constants
  ["lib/constants/plans.ts", util("Plans tarifaires", `export const SUBSCRIPTION_PLANS = ["free", "starter", "pro", "enterprise"] as const;`)],
  ["lib/constants/languages.ts", util("Langages", `export const MVP_LANGUAGES = ["python"] as const;
export const POST_MVP_LANGUAGES = ["java", "c", "cpp"] as const;`)],
  ["lib/constants/incidents.ts", util("Types incidents", `export const INCIDENT_TYPES = ["fullscreen_exit", "tab_switch", "session_close", "network_issue", "clipboard_paste"] as const;`)],
  ["lib/constants/exam.ts", util("Constantes examen", "export const MAX_CODE_ATTEMPTS = 5;\nexport const AUTOSAVE_INTERVAL_MS = 30_000;")],

  // Types
  ["lib/types/auth.ts", util("Types auth", "export type SessionUser = { id: string; role: string; establishmentId: string };")],
  ["lib/types/exam.ts", util("Types examen", "export type ExamStatus = \"draft\" | \"published\" | \"in_progress\" | \"finished\" | \"archived\";")],
  ["lib/types/api.ts", util("Types API", "export type ApiResponse<T> = { data?: T; error?: string };")],

  // Hooks
  ["hooks/use-auth.ts", hook("useAuth")],
  ["hooks/use-exam-timer.ts", hook("useExamTimer")],
  ["hooks/use-autosave.ts", hook("useAutosave")],
  ["hooks/security/use-fullscreen.ts", hook("useFullscreen")],
  ["hooks/security/use-tab-visibility.ts", hook("useTabVisibility")],
  ["hooks/security/use-clipboard-guard.ts", hook("useClipboardGuard")],
  ["hooks/security/use-keyboard-lock.ts", hook("useKeyboardLock")],
  ["hooks/realtime/use-exam-live.ts", hook("useExamLive")],

  // Workers
  ["workers/grading.worker.ts", util("Worker correction", "// TODO: file d'attente correction Judge0/Docker")],
  ["workers/exam-status.worker.ts", util("Worker statut examen", "// TODO: transitions published → in_progress → finished")],

  // Components UI
  ["components/ui/button.tsx", component("Button", "Button")],
  ["components/ui/input.tsx", component("Input", "Input")],
  ["components/ui/card.tsx", component("Card", "Card")],
  ["components/ui/badge.tsx", component("Badge", "Badge")],
  ["components/ui/dialog.tsx", component("Dialog", "Dialog")],
  ["components/ui/table.tsx", component("Table", "Table")],
  ["components/ui/select.tsx", component("Select", "Select")],
  ["components/ui/textarea.tsx", component("Textarea", "Textarea")],
  ["components/ui/tabs.tsx", component("Tabs", "Tabs")],
  ["components/ui/alert.tsx", component("Alert", "Alert")],
  ["components/ui/countdown.tsx", component("Countdown", "Countdown")],

  // Layout
  ["components/layout/sidebar.tsx", component("Sidebar", "Sidebar")],
  ["components/layout/header.tsx", component("Header", "Header")],
  ["components/layout/dashboard-shell.tsx", component("DashboardShell", "DashboardShell")],

  // Auth
  ["components/auth/login-form.tsx", component("LoginForm", "LoginForm")],
  ["components/auth/change-password-form.tsx", component("ChangePasswordForm", "ChangePasswordForm")],
  ["components/auth/establishment-register-form.tsx", component("EstablishmentRegisterForm", "EstablishmentRegisterForm")],

  // Student
  ["components/student/exam-security-consent.tsx", component("ExamSecurityConsent", "ExamSecurityConsent")],
  ["components/student/waiting-room.tsx", component("WaitingRoom", "WaitingRoom")],
  ["components/student/code-editor.tsx", component("CodeEditor", "CodeEditor")],
  ["components/student/exam-timer.tsx", component("ExamTimer", "ExamTimer")],
  ["components/student/exercise-nav.tsx", component("ExerciseNav", "ExerciseNav")],
  ["components/student/exercise-statement.tsx", component("ExerciseStatement", "ExerciseStatement")],
  ["components/student/qcm-question.tsx", component("QcmQuestion", "QcmQuestion")],
  ["components/student/submit-confirm-dialog.tsx", component("SubmitConfirmDialog", "SubmitConfirmDialog")],

  // Teacher
  ["components/teacher/exam-list.tsx", component("ExamList", "ExamList")],
  ["components/teacher/exam-form.tsx", component("ExamForm", "ExamForm")],
  ["components/teacher/exercise-code-form.tsx", component("ExerciseCodeForm", "ExerciseCodeForm")],
  ["components/teacher/exercise-qcm-form.tsx", component("ExerciseQcmForm", "ExerciseQcmForm")],
  ["components/teacher/unit-test-editor.tsx", component("UnitTestEditor", "UnitTestEditor")],
  ["components/teacher/access-code-display.tsx", component("AccessCodeDisplay", "AccessCodeDisplay")],
  ["components/teacher/presentation-mode.tsx", component("PresentationMode", "PresentationMode")],
  ["components/teacher/live-monitor.tsx", component("LiveMonitor", "LiveMonitor")],
  ["components/teacher/results-table.tsx", component("ResultsTable", "ResultsTable")],
  ["components/teacher/submission-review.tsx", component("SubmissionReview", "SubmissionReview")],
  ["components/teacher/incident-timeline.tsx", component("IncidentTimeline", "IncidentTimeline")],
  ["components/teacher/manual-score-form.tsx", component("ManualScoreForm", "ManualScoreForm")],

  // Admin
  ["components/admin/stats-cards.tsx", component("StatsCards", "StatsCards")],
  ["components/admin/class-form.tsx", component("ClassForm", "ClassForm")],
  ["components/admin/academic-year-form.tsx", component("AcademicYearForm", "AcademicYearForm")],
  ["components/admin/student-table.tsx", component("StudentTable", "StudentTable")],
  ["components/admin/student-form.tsx", component("StudentForm", "StudentForm")],
  ["components/admin/csv-import-dialog.tsx", component("CsvImportDialog", "CsvImportDialog")],
  ["components/admin/teacher-form.tsx", component("TeacherForm", "TeacherForm")],
  ["components/admin/plan-selector.tsx", component("PlanSelector", "PlanSelector")],
  ["components/admin/activity-log-table.tsx", component("ActivityLogTable", "ActivityLogTable")],
  ["components/admin/promotion-wizard.tsx", component("PromotionWizard", "PromotionWizard")],

  // Super Admin — Phase 1
  ["components/super-admin/establishment-table.tsx", component("EstablishmentTable", "EstablishmentTable")],
  ["components/super-admin/plan-editor.tsx", component("PlanEditor", "PlanEditor")],
  ["components/super-admin/global-stats.tsx", component("GlobalStats", "GlobalStats")],

  // Exam shared
  ["components/exam/status-badge.tsx", component("ExamStatusBadge", "ExamStatusBadge")],
  ["components/exam/participation-status.tsx", component("ParticipationStatus", "ParticipationStatus")],

  // Shared
  ["components/shared/logo.tsx", component("Logo", "Logo")],
  ["components/shared/empty-state.tsx", component("EmptyState", "EmptyState")],
  ["components/shared/loading-spinner.tsx", component("LoadingSpinner", "LoadingSpinner")],
  ["components/shared/confirm-dialog.tsx", component("ConfirmDialog", "ConfirmDialog")],
  ["components/shared/data-table.tsx", component("DataTable", "DataTable")],

  // Onboarding — Phase 2
  ["components/onboarding/onboarding-wizard.tsx", component("OnboardingWizard", "OnboardingWizard")],

  // Proctor — Phase 3
  ["components/proctor/room-register.tsx", component("RoomRegister", "RoomRegister")],

  // Prisma seed
  ["prisma/seed.ts", util("Seed", `// npx prisma db seed
// TODO: plans tarifaires, super admin initial
`)],

  // Docker
  ["docker/docker-compose.yml", `# Cylentic — Docker Compose (MVP)
# services: app, postgres, redis, sandbox
version: "3.9"
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: cylentic
      POSTGRES_USER: cylentic
      POSTGRES_PASSWORD: cylentic
    ports:
      - "5432:5432"
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
`],
  ["docker/sandbox/Dockerfile", `FROM python:3.11.15-alpine
# Sandbox isolé — exécution code étudiant sans réseau
WORKDIR /sandbox
`],
  ["docker/redis/.gitkeep", ""],

  // Env example
  [".env.example", `# Base de données PostgreSQL
DATABASE_URL="postgresql://cylentic:cylentic@localhost:5432/cylentic?schema=cylentic"

# JWT
JWT_SECRET="change-me-in-production"
JWT_EXPIRES_IN="8h"

# Redis
REDIS_URL="redis://localhost:6379"

# Email (notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""

# Sandbox
SANDBOX_TIMEOUT_MS=5000
SANDBOX_MEMORY_MB=128
`],
];

let created = 0;
let skipped = 0;
for (const [rel, content] of files) {
  if (write(rel, content)) created++;
  else skipped++;
}
console.log(`Created: ${created}, Skipped (existing): ${skipped}`);
