import { LLMErrorCodeType } from "./llm.model";

export class LLMError extends Error {
  constructor(
    public readonly code: LLMErrorCodeType,
    message: string,
    options?: ErrorOptions
  ) {
    super(message, options);
    this.name = 'LLMError'
  }
}