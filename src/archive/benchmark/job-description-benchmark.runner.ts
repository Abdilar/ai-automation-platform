import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { JobDescriptionType } from '../../domain/job/job-description.schema';
import type { TestScenario } from '../../tests/job-description-real.scenarios';

interface Check { label: string; passed: boolean; detail?: string }
export interface CaseResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'ERROR';
  durationMs: number;
  checks: Check[];
  expected: TestScenario['expected'];
  actual?: JobDescriptionType;
  error?: string;
}

const normalize = (s: string) => s.trim().toLocaleLowerCase().replace(/\s+/g, ' ');
const json = (value: unknown) => JSON.stringify(value, null, 2);
const codeFence = (value: unknown) => {
  const content = typeof value === 'string' ? value : json(value);
  const ticks = '`'.repeat(Math.max(3, ...Array.from(content.matchAll(/`+/g), m => m[0].length + 1)));
  return `${ticks}json\n${content}\n${ticks}`;
};

function evaluate(actual: JobDescriptionType, expected: TestScenario['expected']): Check[] {
  const checks: Check[] = [];
  if (expected.workMode !== undefined) {
    checks.push({ label: 'workMode', passed: actual.workMode === expected.workMode, detail: `expected=${json(expected.workMode)}, actual=${json(actual.workMode)}` });
  }
  if (expected.visaSponsorship !== undefined) {
    checks.push({ label: 'visaSponsorship', passed: actual.visaSponsorship === expected.visaSponsorship, detail: `expected=${json(expected.visaSponsorship)}, actual=${json(actual.visaSponsorship)}` });
  }
  for (const skill of expected.requiredSkills ?? []) {
    checks.push({ label: `required skill: ${skill}`, passed: actual.skills.some(s => normalize(s) === normalize(skill)), detail: `skills=${json(actual.skills)}` });
  }
  for (const field of expected.emptyFields ?? []) {
    const value = actual[field];
    checks.push({ label: `empty field: ${field}`, passed: value === null || (Array.isArray(value) && value.length === 0), detail: `actual=${json(value)}` });
  }
  if (expected.minResponsibilities !== undefined) {
    checks.push({ label: `minResponsibilities >= ${expected.minResponsibilities}`, passed: actual.responsibilities.length >= expected.minResponsibilities, detail: `actual=${actual.responsibilities.length}` });
  }
  for (const responsibility of expected.requiredResponsibilities ?? []) {
    checks.push({ label: `required responsibility: ${responsibility}`, passed: actual.responsibilities.some(r => normalize(r).includes(normalize(responsibility))), detail: `responsibilities=${json(actual.responsibilities)}` });
  }
  return checks;
}

function markdown(results: CaseResult[], startedAt: string): string {
  const pass = results.filter(r => r.status === 'PASS').length;
  const fail = results.filter(r => r.status === 'FAIL').length;
  const error = results.filter(r => r.status === 'ERROR').length;
  const checks = results.flatMap(r => r.checks);
  const passedChecks = checks.filter(c => c.passed).length;
  const lines = [
    '# Job Description Extractor — Real Ads Benchmark', '',
    `- Started: ${startedAt}`,
    `- Total cases: ${results.length}`,
    `- Passed: ${pass} | Failed: ${fail} | Errors: ${error}`,
    `- Case pass rate: ${results.length ? (pass / results.length * 100).toFixed(1) : '0.0'}%`,
    `- Assertion pass rate: ${checks.length ? (passedChecks / checks.length * 100).toFixed(1) : 'N/A'}% (${passedChecks}/${checks.length})`, '',
    '## Overview', '',
    '| Case | Status | Assertions | Duration (ms) |',
    '| --- | --- | --- | ---: |',
    ...results.map(r => `| ${r.name.replace(/\|/g, '\\|')} | ${r.status} | ${r.checks.filter(c => c.passed).length}/${r.checks.length} | ${r.durationMs} |`),
    '', '## Case details', '',
  ];
  for (const r of results) {
    lines.push(`### ${r.name}`, '', `**Status:** ${r.status} · **Duration:** ${r.durationMs} ms`, '',
      '**Expected assertions:**', '', codeFence(r.expected), '');
    if (r.checks.length) {
      lines.push('| Assertion | Result |', '| --- | --- |',
        ...r.checks.map(c => `| ${c.label.replace(/\|/g, '\\|')} | ${c.passed ? 'PASS' : 'FAIL'} |`), '');
      const failures = r.checks.filter(c => !c.passed);
      if (failures.length) {
        lines.push('**Failed assertion details:**', '');
        for (const c of failures) lines.push(`- **${c.label}**`, '', codeFence(c.detail ?? ''), '');
      }
    }
    if (r.error) lines.push('**Execution error:**', '', codeFence(r.error), '');
    if (r.actual) lines.push('**Actual model output:**', '', codeFence(r.actual), '');
  }
  return lines.join('\n') + '\n';
}

export interface BenchmarkOptions {
  reportPath?: string;
  jsonPath?: string;
  delayMs?: number;
  limit?: number;
}

export async function runJobDescriptionBenchmark(
  scenarios: TestScenario[],
  extract: (input: string) => Promise<JobDescriptionType>,
  options: BenchmarkOptions = {},
): Promise<{
  passed: number;
  failed: number;
  errors: number;
  reportPath: string;
  jsonPath: string;
}> {
  const {
    reportPath = 'reports/job-description-benchmark.md',
    jsonPath = 'reports/job-description-benchmark.json',
    delayMs = 0,
    limit = scenarios.length,
  } = options;

  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('Benchmark limit must be a positive integer');
  }

  const selectedScenarios = scenarios.slice(0, limit);
  const results: CaseResult[] = [];
  const startedAt = new Date().toISOString();

  await Promise.all([
    mkdir(dirname(reportPath), { recursive: true }),
    mkdir(dirname(jsonPath), { recursive: true }),
  ]);

  for (const scenario of selectedScenarios) {
    const start = Date.now();

    try {
      const actual = await extract(scenario.input);
      const checks = evaluate(actual, scenario.expected);

      results.push({
        name: scenario.name,
        status: checks.every(check => check.passed)
          ? 'PASS'
          : 'FAIL',
        durationMs: Date.now() - start,
        checks,
        expected: scenario.expected,
        actual,
      });
    } catch (error) {
      results.push({
        name: scenario.name,
        status: 'ERROR',
        durationMs: Date.now() - start,
        checks: [],
        expected: scenario.expected,
        error: error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error),
      });
    }

    await Promise.all([
      writeFile(
        reportPath,
        markdown(results, startedAt),
        'utf8',
      ),
      writeFile(
        jsonPath,
        JSON.stringify({
          startedAt,
          completed: results.length,
          total: selectedScenarios.length,
          results,
        }, null, 2),
        'utf8',
      ),
    ]);

    const current = results.at(-1)!;

    console.log(
      `[${results.length}/${selectedScenarios.length}]`,
      current.status,
      scenario.name,
    );

    if (delayMs > 0 && results.length < selectedScenarios.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return {
    passed: results.filter(r => r.status === 'PASS').length,
    failed: results.filter(r => r.status === 'FAIL').length,
    errors: results.filter(r => r.status === 'ERROR').length,
    reportPath,
    jsonPath,
  };
}

