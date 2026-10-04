import assert from 'node:assert/strict';



import { LLMJobDescriptionExtractor } from '../application/extract-job-description';
import { OllamaProvider } from '../infrastructure/llm-provider';

const jobDescription = `
Senior Frontend Engineer

We are looking for a Senior Frontend Engineer
to join our product development team.

You will work closely with product designers,
backend engineers, and other frontend developers
to build scalable web applications.

Responsibilities:
- Develop and maintain frontend applications using React and TypeScript.
- Build reusable UI components.
- Review pull requests from other engineers.
- Improve frontend performance.
- Collaborate with product and design teams.

Requirements:
- At least 4 years of professional frontend development experience.
- Strong knowledge of React.
- Strong knowledge of TypeScript.
- Experience with REST APIs.
- Experience with Git.

Nice to have:
- Experience with Next.js.
- Knowledge of automated testing.
- Experience with Docker.

Benefits:
- Private health insurance.
- Learning and development budget.
- Flexible working hours.
- 25 days of paid vacation.

This is a fully remote position.

We provide visa sponsorship for qualified candidates.
`;

async function run() {
  const provider = new OllamaProvider(
    'qwen3:8b',
  );

  const extractor =
    new LLMJobDescriptionExtractor(
      provider,
    );

  const result =
    await extractor.extract(
      jobDescription,
    );

  console.dir(result, {
    depth: null,
  });

  assert.equal(
    result.workMode,
    'REMOTE',
  );

  assert.equal(
    result.visaSponsorship,
    'AVAILABLE',
  );

  assert.ok(
    result.skills?.includes('React'),
  );

  assert.ok(
    result.skills?.includes('TypeScript'),
  );

  assert.ok(
    result.responsibilities?.length,
  );

  assert.ok(
    result.requirements?.length,
  );

  assert.ok(
    result.preferredQualifications?.length,
  );

  assert.ok(
    result.benefits?.length,
  );
}

run();