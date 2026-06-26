import type { OnboardingStepId } from "@/lib/constants/onboarding";

export interface OnboardingStepStatus {
  id: OnboardingStepId;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  count?: number;
}

export interface OnboardingStatus {
  establishment: {
    id: string;
    name: string;
    acronym: string;
  };
  subscription: {
    planName: string;
    trialEndsAt: string | null;
    isSimulated: boolean;
  } | null;
  isComplete: boolean;
  completedAt: string | null;
  progress: number;
  canFinish: boolean;
  steps: OnboardingStepStatus[];
}
