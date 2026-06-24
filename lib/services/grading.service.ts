import { prisma } from "@/lib/prisma";
import { sandboxService } from "@/lib/services/sandbox.service";

function normalizeOutput(output: string): string {
  return output.trim().replace(/\r\n/g, "\n");
}

export const gradingService = {
  async gradeSubmission(submissionId: string) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        exercise: {
          include: {
            unitTests: { orderBy: { orderIndex: "asc" } },
          },
        },
      },
    });

    if (!submission?.sourceCode || submission.exercise.correctionMode === "manual") {
      return submission;
    }

    const tests = submission.exercise.unitTests;
    if (tests.length === 0) return submission;

    let passedCount = 0;
    let totalWeight = 0;
    let earnedWeight = 0;

    for (const test of tests) {
      totalWeight += Number(test.weight);
      const result = await sandboxService.executePython(
        submission.sourceCode,
        test.input ?? undefined,
      );

      const actual = normalizeOutput(result.stdout);
      const expected = normalizeOutput(test.expectedOutput);
      const passed = result.exitCode === 0 && actual === expected;

      if (passed) {
        passedCount++;
        earnedWeight += Number(test.weight);
      }

      await prisma.submissionTestResult.create({
        data: {
          submissionId,
          unitTestId: test.id,
          passed,
          actualOutput: actual,
          stderr: result.stderr || null,
          status: result.timedOut ? "TLE" : result.exitCode === 0 ? "Accepted" : "Runtime Error",
          timeMs: result.timeMs,
        },
      });
    }

    const ratio = totalWeight > 0 ? earnedWeight / totalWeight : 0;
    const points = Number(submission.exercise.points);
    const autoScore = Math.round(ratio * points * 100) / 100;

    return prisma.submission.update({
      where: { id: submissionId },
      data: {
        autoScore,
        finalScore: autoScore,
      },
    });
  },

  async gradeParticipation(participationId: string) {
    const submissions = await prisma.submission.findMany({
      where: { participationId },
    });

    let totalAuto = 0;
    for (const sub of submissions) {
      const graded = await this.gradeSubmission(sub.id);
      totalAuto += Number(graded?.autoScore ?? 0);
    }

    await prisma.examParticipation.update({
      where: { id: participationId },
      data: {
        autoScore: totalAuto,
        finalScore: totalAuto,
      },
    });

    return totalAuto;
  },
};
