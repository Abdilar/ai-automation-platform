export interface IGenerateOptions<T> {
  prompt: string;
  schema: object;
}

export interface ILLMProvider {
  generate<T>(options: IGenerateOptions<T>): Promise<T>;
}

