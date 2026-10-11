
import 'dotenv/config';

import { realJobScenarios } from '../../tests/job-description-real.scenarios';
import { runJobDescriptionBenchmark } from './job-description-benchmark.runner';
import { OpenAIProvider } from '../../infrastructure/llm-provider';
import { LLMJobDescriptionExtractor } from '../../application/service/extract-job-description.service';

async function main() {
  const rawLimit = process.argv[2] ?? '3';
  const limit = Number(rawLimit);

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Specify a positive scenario count');
  }

  const provider = new OpenAIProvider();
  const extractor = new LLMJobDescriptionExtractor(provider);

  const runId = new Date()
    .toISOString()
    .replace(/[:.]/g, '-');

  const basePath = `reports/v2/${runId}`;

  const result = await runJobDescriptionBenchmark(
    realJobScenarios,
    input => extractor.extract(input),
    {
      limit,
      delayMs: 1000,
      reportPath: `${basePath}/benchmark.md`,
      jsonPath: `${basePath}/benchmark.json`,
    },
  );

  console.log('Benchmark completed:', result);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
