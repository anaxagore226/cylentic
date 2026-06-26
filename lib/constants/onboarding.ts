export const ONBOARDING_STEP_IDS = [
  "welcome",
  "academic_year",
  "classes",
  "teachers",
  "students",
  "complete",
] as const;

export type OnboardingStepId = (typeof ONBOARDING_STEP_IDS)[number];

export const ONBOARDING_STEP_META: Record<
  OnboardingStepId,
  { title: string; description: string; required: boolean }
> = {
  welcome: {
    title: "Bienvenue",
    description: "Découvrez votre espace et votre essai gratuit",
    required: false,
  },
  academic_year: {
    title: "Année académique",
    description: "Définissez l'année scolaire en cours",
    required: true,
  },
  classes: {
    title: "Classes",
    description: "Créez le référentiel des promotions",
    required: true,
  },
  teachers: {
    title: "Professeurs",
    description: "Ajoutez au moins un enseignant",
    required: true,
  },
  students: {
    title: "Étudiants",
    description: "Enregistrez vos premiers étudiants",
    required: false,
  },
  complete: {
    title: "Terminé",
    description: "Accédez à votre tableau de bord",
    required: false,
  },
};
