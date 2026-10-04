import z from "zod";
import { IJobDescriptionExtractor } from "../domain/job/job-description.model";
import { JobDescriptionSchema, JobDescriptionType } from "../domain/job/job-description.schema";
import { ILLMProvider } from "../infrastructure/llm-provider/llm-provider.model";

export class LLMJobDescriptionExtractor implements IJobDescriptionExtractor {
  constructor(private readonly llmProvider: ILLMProvider) {}

  async extract(content: string): Promise<JobDescriptionType> {
    const prompt = this.buildPrompt(content)

    const result = this.llmProvider.generate<JobDescriptionType>({
      prompt,
      schema: z.toJSONSchema(JobDescriptionSchema)
    })

    return JobDescriptionSchema.parse(result)
  }

  private buildPrompt(content: string): string {
    return `
      You are a job description information extraction system.

Extract structured information from the provided job description.

IMPORTANT RULES:

1. Extract only information explicitly stated in the input.
2. Never infer, assume, or guess missing information.
3. If a field is not explicitly mentioned, omit it.
4. Do not add information based on common industry knowledge.
5. Preserve technology and skill names as written when possible.
6. Do not invent requirements, benefits, or responsibilities.
7. The input may be written in English, Persian, or a mixture of both.

FIELD RULES:

description:
- Extract the general description or summary of the position.
- Do not include requirements, responsibilities, or benefits unless they are part of the general description.

skills:
- Extract explicit technical or professional skills.
- Examples: React, TypeScript, PostgreSQL, Docker, communication skills.
- Do not infer skills from the job title.

responsibilities:
- Extract tasks and responsibilities the employee is expected to perform.

requirements:
- Extract mandatory qualifications or conditions.
- Examples include required experience, education, technical knowledge, certifications, or other mandatory qualifications.

preferredQualifications:
- Extract qualifications explicitly described as preferred, optional, bonus, nice-to-have, or similar.

benefits:
- Extract benefits offered by the employer.
- Examples include health insurance, paid vacation, bonuses, equipment, or learning budget.

workMode:
- REMOTE only when the job explicitly states that it is remote.
- HYBRID only when hybrid work is explicitly stated.
- ONSITE only when office/on-site presence is explicitly required.
- Otherwise omit this field.

visaSponsorship:
- AVAILABLE only when visa sponsorship is explicitly offered.
- NOT_AVAILABLE only when the job explicitly says sponsorship is unavailable or candidates must already have work authorization.
- Otherwise omit this field.

Return only structured data matching the provided schema.

JOB DESCRIPTION:

${content}
    `;
  }
}
