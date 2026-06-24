import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { writeFile, mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";

const exec = promisify(execFile);

const TIMEOUT_MS = Number(process.env.SANDBOX_TIMEOUT_MS ?? 5000);
const MEMORY_MB = Number(process.env.SANDBOX_MEMORY_MB ?? 128);

export interface SandboxResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  timeMs: number;
  timedOut: boolean;
}

async function runWithPythonLocal(
  scriptPath: string,
  cwd: string,
): Promise<SandboxResult> {
  const start = Date.now();
  try {
    const { stdout, stderr } = await exec(
      "python",
      [scriptPath],
      { cwd, timeout: TIMEOUT_MS, maxBuffer: 1024 * 1024 },
    );
    return {
      stdout: stdout ?? "",
      stderr: stderr ?? "",
      exitCode: 0,
      timeMs: Date.now() - start,
      timedOut: false,
    };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number; killed?: boolean };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? String(err),
      exitCode: typeof e.code === "number" ? e.code : 1,
      timeMs: Date.now() - start,
      timedOut: Boolean(e.killed),
    };
  }
}

async function runWithDocker(
  scriptPath: string,
  hostDir: string,
): Promise<SandboxResult> {
  const start = Date.now();
  const containerPath = "/sandbox/script.py";

  try {
    const { stdout, stderr } = await exec(
      "docker",
      [
        "run",
        "--rm",
        "--network",
        "none",
        `--memory=${MEMORY_MB}m`,
        "--cpus=0.5",
        "-v",
        `${hostDir}:${containerPath.slice(0, containerPath.lastIndexOf("/"))}:ro`,
        "python:3.11.15-alpine",
        "python",
        containerPath,
      ],
      { timeout: TIMEOUT_MS + 2000, maxBuffer: 1024 * 1024 },
    );
    return {
      stdout: stdout ?? "",
      stderr: stderr ?? "",
      exitCode: 0,
      timeMs: Date.now() - start,
      timedOut: false,
    };
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string; code?: number; killed?: boolean };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? String(err),
      exitCode: typeof e.code === "number" ? e.code : 1,
      timeMs: Date.now() - start,
      timedOut: Boolean(e.killed),
    };
  }
}

export const sandboxService = {
  async executePython(studentCode: string, testSnippet?: string): Promise<SandboxResult> {
    const fullCode = testSnippet
      ? `${studentCode}\n\n# --- test ---\n${testSnippet}`
      : studentCode;

    const workDir = join(tmpdir(), `cylentic-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });
    const scriptPath = join(workDir, "script.py");

    try {
      await writeFile(scriptPath, fullCode, "utf8");

      const useDocker = process.env.SANDBOX_USE_DOCKER !== "false";
      if (useDocker) {
        try {
          return await runWithDocker(scriptPath, workDir);
        } catch {
          return runWithPythonLocal(scriptPath, workDir);
        }
      }
      return runWithPythonLocal(scriptPath, workDir);
    } finally {
      await rm(workDir, { recursive: true, force: true }).catch(() => {});
    }
  },
};
