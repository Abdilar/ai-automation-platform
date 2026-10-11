import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { JobDescriptionType } from '../../domain/job/job-description.schema';
import type { TestScenario } from '../../tests/job-description-real.scenarios';
import { evaluateJobDescription, type SemanticJudge, type SemanticResult } from '../../tests/job-description.semantic-evaluator';

type CaseReport = {
  name: string;
  result?: SemanticResult;
  error?: string;
};

/** Evaluates precomputed extractor outputs: no extraction API calls or duplicated extraction cost. */
export async function runSemanticBenchmark(
  scenarios: TestScenario[],
  outputs: Map<string, JobDescriptionType>,
  judge: SemanticJudge,
  reportPath = 'reports/job-description-semantic.json',
  delayMs = 0,
): Promise<CaseReport[]> {
  const reports: CaseReport[] = [];
  await mkdir(dirname(reportPath), { recursive: true });
  for (const scenario of scenarios) {
    const actual = outputs.get(scenario.name);
    if (!actual) {
      reports.push({ name: scenario.name, error: 'No extractor output available' });
    } else {
      try {
        reports.push({ name: scenario.name, result: await evaluateJobDescription(scenario.input, actual, judge) });
      } catch (e) {
        reports.push({ name: scenario.name, error: e instanceof Error ? e.message : String(e) });
      }
    }
    const completed = reports.filter(r => r.result);
    const report = {
      judgeModel: judge.model,
      completed: completed.length,
      errors: reports.length - completed.length,
      averageScore: completed.length ? Math.round(completed.reduce((s, r) => s + r.result!.score, 0) / completed.length) : null,
      cases: reports,
    };
    await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    console.log(`${scenario.name}: ${reports.at(-1)?.result?.score ?? 'ERROR'}`);
    if (delayMs > 0 && reports.length < scenarios.length) await new Promise(r => setTimeout(r, delayMs));
  }
  return reports;
}

/** Extract the already-recorded JSON outputs from the existing Markdown benchmark. */
export function parseBenchmarkMarkdown(markdown: string): Map<string, JobDescriptionType> {
  const outputs = new Map<string, JobDescriptionType>();
  const sections = markdown.split(/^### /m).slice(1);
  for (const section of sections) {
    const name = section.split('\n')[0].trim();
    const match = section.match(/\*\*Actual model output:\*\*\s*```json\s*([\s\S]*?)\s*```/);
    if (match) {
      try { outputs.set(name, JSON.parse(match[1]) as JobDescriptionType); }
      catch (e) { throw new Error(`Invalid JSON in case ${name}`, { cause: e }); }
    }
  }
  return outputs;
}
