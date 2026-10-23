import "dotenv/config";
import OpenAI from "openai";
import type { IGenerateOptions, ILLMProvider } from "../llm-provider.model";
import { LLM_HTTP_ERRORS, LLMError, llmErrorHandler } from "../../../api";

export class OpenAIProvider implements ILLMProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(
    model: string | undefined = process.env.OPENAI_MODEL,
    apiKey: string | undefined = process.env.AVAL_AI_API_KEY,
    baseURL: string | undefined = process.env.AVAL_AI_BASE_URL,
    private readonly temperature?: number,
  ) {
    if (!apiKey) {
      throw new Error(
        "AVAL_AI_API_KEY is not configured. Check your environment variables.",
      );
    }

    if (!baseURL) {
      throw new Error(
        "AVAL_AI_BASE_URL is not configured. Check your environment variables.",
      );
    }
    this.client = new OpenAI({
      apiKey,
      baseURL,
      timeout: 120_000,
      maxRetries: 2,
    });
    this.model = model ?? "gpt-6-astra";
    console.log("The Model is " + this.model);
  }

  async generate<T>(options: IGenerateOptions<T>): Promise<T> {
    let response: Awaited<ReturnType<OpenAI["responses"]["create"]>>;
    try {
      response = await this.client.responses.create({
        model: this.model,
        input: options.prompt,
        ...(this.temperature !== undefined
          ? { temperature: this.temperature }
          : {}),
        text: {
          format: {
            type: "json_schema",
            name: "structured_output",
            strict: true,
            schema: options.schema as Record<string, unknown>,
          },
        },
      });
    } catch (error) {
      throw llmErrorHandler(error);
    }

    const output = response.output_text;

    if (!output) {
      throw new LLMError(
        LLM_HTTP_ERRORS.LLM_INVALID_RESPONSE.code,
        "OpenAI returned an empty structured response",
      );
    }

    try {
      return JSON.parse(output) as T;
    } catch (error) {
      throw new LLMError(
        LLM_HTTP_ERRORS.LLM_INVALID_RESPONSE.code,
        LLM_HTTP_ERRORS.LLM_INVALID_RESPONSE.message,
        { cause: error },
      );
    }
  }
}
