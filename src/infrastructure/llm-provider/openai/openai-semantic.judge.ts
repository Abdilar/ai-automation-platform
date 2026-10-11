import type { SemanticJudge } from '../../../tests/job-description.semantic-evaluator';
import { OpenAIProvider } from './openai.provider';
import { semanticEvaluationJsonSchema } from './semantic-evaluation.schema';

export class OpenAISemanticJudge implements SemanticJudge {
  readonly model: string;

  private readonly provider: OpenAIProvider;

  constructor(model = 'gpt-5-mini') {
    this.model = model;
    this.provider = new OpenAIProvider(model);
  }

  async evaluate(
    systemPrompt: string,
    userPrompt: string,
  ) {
    const prompt = [
      `SYSTEM INSTRUCTIONS:\n${systemPrompt}`,
      `USER INPUT:\n${userPrompt}`,
    ].join('\n\n');

    return this.provider.generate({
      prompt,
      schema: semanticEvaluationJsonSchema,
    });
  }
}