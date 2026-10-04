import ollama from "ollama";
import { IGenerateOptions, ILLMProvider } from "../llm-provider.model";

export class OllamaProvider implements ILLMProvider {
  constructor(private readonly model: string) {}

  async generate<T>(options: IGenerateOptions<T>): Promise<T> {
    const response = await ollama.chat({
      model: this.model,
      messages: [
        {
          role: "user",
          content: options.prompt,
        },
      ],
      format: options.schema,
      options: {
        temperature: 0
      }
    });

    return JSON.parse(response.message.content) as T
  }
}
