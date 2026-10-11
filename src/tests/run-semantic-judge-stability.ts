
import "dotenv/config";

import { semanticJudgeTestCases } from "./semantic-judge.test-cases";
import { runSemanticJudgeStability } from "./semantic-judge.stability-runner";
import { OpenAISemanticJudge } from "../infrastructure/llm-provider/openai/openai-semantic.judge";

async function main() {
  const repetitions = Number(process.argv[2] ?? "5");

  if (!Number.isInteger(repetitions) || repetitions < 1) {
    throw new Error("Provide a positive integer for repetitions");
  }

  const judge = new OpenAISemanticJudge("gpt-5-mini");

  const report = await runSemanticJudgeStability(
    semanticJudgeTestCases,
    judge,
    {
      repetitions,
      delayMs: 1000,
      reportPath: "reports/judge-stability.json",
    },
  );

  console.log("\nStability Results:");

  console.table(
    report.scenarios.map((scenario) => ({
      scenario: scenario.name,
      passed: `${scenario.passed}/${scenario.totalRuns}`,
      detectionRate: `${scenario.detectionRate}%`,
      exactMatchRate: `${scenario.passRate}%`,
      errors: scenario.errors,
    })),
  );

  console.log("\nOverall:");
  console.log("Detection Rate:", `${report.detectionRate}%`);
  console.log("Exact Match Rate:", `${report.exactMatchRate}%`);
  console.log("Errors:", report.totalErrors);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
