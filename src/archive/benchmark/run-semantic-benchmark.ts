import "dotenv/config";

import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";

import {
  JobDescriptionSchema,
  JobDescriptionType,
} from "../../domain/job/job-description.schema";

import { realJobScenarios } from "../../tests/job-description-real.scenarios";



import { OpenAISemanticJudge } from "../../infrastructure/llm-provider";
import { runSemanticBenchmark } from "./job-description.semantic-benchmark";


async function main() {
  const inputPath = process.argv[2];

  if (!inputPath) {
    throw new Error(
      "Usage: npx tsx src/tests/run-semantic-benchmark.ts <benchmark.json>",
    );
  }

  const content = await readFile(inputPath, "utf8");

  const benchmark = JSON.parse(content) as {
    results: Array<{
      name: string;
      actual?: unknown;
    }>;
  };

  const scenarioByName = new Map(
    realJobScenarios.map((scenario) => [scenario.name, scenario]),
  );

  const scenarios = [];
  const outputs = new Map<string, JobDescriptionType>();

  for (const result of benchmark.results) {
    if (result.actual === undefined) continue;

    const scenario = scenarioByName.get(result.name);

    if (!scenario) {
      throw new Error(`Scenario not found: ${result.name}`);
    }

    scenarios.push(scenario);
    outputs.set(scenario.name, JobDescriptionSchema.parse(result.actual));
  }

  if (scenarios.length === 0) {
    throw new Error("No valid extracted outputs found");
  }

  const judge = new OpenAISemanticJudge("gpt-5-mini");

  const outputPath = join(dirname(inputPath), "semantic-evaluation.json");

  const result = await runSemanticBenchmark(
    scenarios,
    outputs,
    judge,
    outputPath,
    35_000,
  );

  console.log("Semantic benchmark result:", result);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
