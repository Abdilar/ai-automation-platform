
import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  evaluateJobDescription,
  type SemanticJudge,
} from "./job-description.semantic-evaluator";

import type { JudgeTestCase } from "./semantic-judge.test-cases";

type Finding = {
  category: string;
  field: string;
  severity: string;
  message: string;
  sourceEvidence: string | null;
  outputEvidence: string | null;
};

interface TrialResult {
  iteration: number;
  status: "PASS" | "FAIL" | "ERROR";
  detectionMatch: boolean;
  exactMatch: boolean;
  score: number | null;
  findings: Finding[];
  error?: string;
}

interface ScenarioResult {
  name: string;
  totalRuns: number;
  passed: number;
  detectionPassed: number;
  errors: number;
  passRate: number;
  detectionRate: number;
  trials: TrialResult[];
}

function detectionKey(finding: {
  category: string;
  field: string;
}): string {
  return `${finding.category}:${finding.field}`;
}

function exactKey(finding: {
  category: string;
  field: string;
  severity: string;
}): string {
  return `${finding.category}:${finding.field}:${finding.severity}`;
}

function sameFindings(
  expected: string[],
  actual: string[],
): boolean {
  return JSON.stringify([...expected].sort()) ===
    JSON.stringify([...actual].sort());
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function runSemanticJudgeStability(
  cases: JudgeTestCase[],
  judge: SemanticJudge,
  options: {
    repetitions?: number;
    delayMs?: number;
    reportPath?: string;
  } = {},
) {
  const {
    repetitions = 5,
    delayMs = 1000,
    reportPath = "reports/judge-stability.json",
  } = options;

  if (!Number.isInteger(repetitions) || repetitions < 1) {
    throw new Error("repetitions must be a positive integer");
  }

  const scenarios: ScenarioResult[] = [];

  await mkdir(dirname(reportPath), { recursive: true });

  for (const testCase of cases) {
    const trials: TrialResult[] = [];

    console.log(`\nScenario: ${testCase.name}`);

    for (let iteration = 1; iteration <= repetitions; iteration++) {
      try {
        const result = await evaluateJobDescription(
          testCase.source,
          testCase.extracted,
          judge,
        );

        const detectionMatch = sameFindings(
          testCase.expected.findings.map(detectionKey),
          result.findings.map(detectionKey),
        );

        const exactMatch = sameFindings(
          testCase.expected.findings.map(exactKey),
          result.findings.map(exactKey),
        );

        trials.push({
          iteration,
          status: exactMatch ? "PASS" : "FAIL",
          detectionMatch,
          exactMatch,
          score: result.score,
          findings: result.findings,
        });

        console.log(
          `[${iteration}/${repetitions}]`,
          exactMatch ? "PASS" : "FAIL",
          `Detection: ${detectionMatch}`,
          `Score: ${result.score}`,
        );

        if (!exactMatch) {
          console.dir(result.findings, { depth: null });
        }
      } catch (error) {
        trials.push({
          iteration,
          status: "ERROR",
          detectionMatch: false,
          exactMatch: false,
          score: null,
          findings: [],
          error: error instanceof Error
            ? error.message
            : String(error),
        });

        console.error(
          `[${iteration}/${repetitions}] ERROR:`,
          error,
        );
      }

      // Persist progress after each request.
      const partial = {
        judgeModel: judge.model,
        repetitions,
        scenarios: [
          ...scenarios,
          {
            name: testCase.name,
            trials,
          },
        ],
      };

      await writeFile(
        reportPath,
        JSON.stringify(partial, null, 2),
        "utf8",
      );

      if (delayMs > 0 && iteration < repetitions) {
        await sleep(delayMs);
      }
    }

    const passed = trials.filter((t) => t.exactMatch).length;
    const detectionPassed =
      trials.filter((t) => t.detectionMatch).length;
    const errors =
      trials.filter((t) => t.status === "ERROR").length;

    scenarios.push({
      name: testCase.name,
      totalRuns: repetitions,
      passed,
      detectionPassed,
      errors,
      passRate: Math.round((passed / repetitions) * 100),
      detectionRate: Math.round(
        (detectionPassed / repetitions) * 100,
      ),
      trials,
    });
  }

  const totalRuns = scenarios.reduce(
    (sum, scenario) => sum + scenario.totalRuns,
    0,
  );

  const totalPassed = scenarios.reduce(
    (sum, scenario) => sum + scenario.passed,
    0,
  );

  const totalDetectionPassed = scenarios.reduce(
    (sum, scenario) => sum + scenario.detectionPassed,
    0,
  );

  const totalErrors = scenarios.reduce(
    (sum, scenario) => sum + scenario.errors,
    0,
  );

  const report = {
    judgeModel: judge.model,
    repetitions,
    totalRuns,
    totalPassed,
    totalDetectionPassed,
    totalErrors,
    exactMatchRate: totalRuns
      ? Math.round((totalPassed / totalRuns) * 100)
      : 0,
    detectionRate: totalRuns
      ? Math.round((totalDetectionPassed / totalRuns) * 100)
      : 0,
    scenarios,
  };

  await writeFile(
    reportPath,
    JSON.stringify(report, null, 2),
    "utf8",
  );

  return report;
}
