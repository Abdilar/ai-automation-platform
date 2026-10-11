import z from "zod";
import { IJobDescriptionExtractor } from "../../domain/job/job-description.model";
import {
  JobDescriptionSchema,
  JobDescriptionType,
} from "../../domain/job/job-description.schema";
import { ILLMProvider } from "../../infrastructure/llm-provider/llm-provider.model";

export class LLMJobDescriptionExtractor implements IJobDescriptionExtractor {
  constructor(private readonly llmProvider: ILLMProvider) {}

  async extract(content: string): Promise<JobDescriptionType> {
    const prompt = this.buildPrompt(content);

    const result = await this.llmProvider.generate<JobDescriptionType>({
      prompt,
      schema: z.toJSONSchema(JobDescriptionSchema),
    });

    console.dir(result, {
      depth: null,
    });
    return JobDescriptionSchema.parse(result);
  }

  private buildPrompt(content: string): string {
    return `
You are a precise job description information extractor.

Extract structured information exclusively from the provided
job advertisement.

GENERAL RULES:
1. Extract only information explicitly supported by the source.
2. Never invent, assume, or infer missing facts.
3. Preserve the original meaning and language of descriptive text.
4. Normalize obvious spelling mistakes in extracted values.
5. Do not duplicate entries within the same array.
6. Preserve the order of first appearance whenever possible.
7. Return [] for missing array fields.
8. Return null for unspecified nullable fields.
9. Classify statements by their meaning, not only their headings.
10. Return only the structured output required by the schema.

DESCRIPTION:
- Extract only the introductory description of the job position.
- Preserve the original meaning and language.
- Do not include company introductions, requirements,
  responsibilities, preferred qualifications, or benefits.
- Return null if no meaningful job position introduction exists.

COMPANY DESCRIPTION:
- Extract information explicitly describing the hiring company.
- Include the company's business domain, products, services,
  history, mission, and other factual introductory information.
- Preserve the original meaning and language.
- Do not include job responsibilities, hiring requirements,
  preferred qualifications, or employment benefits.
- Do not invent company information based on its name or industry.
- Return null if the advertisement provides no meaningful
  company description.

SKILLS:
- Extract all explicitly mentioned skills and technologies
  relevant to the actual job position.
- Include both required and preferred skills.
- Include technical skills and explicitly stated professional
  competencies.
- Extract concise, canonical skill names instead of full sentences.
- Preserve significant version information when explicitly required.
- Do not invent related technologies or broader skill categories.
- Do not extract every syllabus topic, technical concept,
  or incidental keyword as a separate skill.
- Do not extract technologies mentioned exclusively as permitted
  languages or tools for the hiring/interview process.
- A technology explicitly mentioned in a job duty may be included
  if it represents a concrete skill used in performing that duty.
- Avoid duplicate or synonymous names within skills.
- Skills may overlap with requirements and preferredQualifications.
  Such cross-field overlap is intentional and valid.

Examples:
"آشنایی با SQL" -> "SQL"
"Linux systems administration" -> "Linux"
"تسلط به React.js" -> "React"
"Familiarity with Kafka is a plus" -> "Kafka"

RESPONSIBILITIES:
- Extract explicitly stated actions and duties the employee
  is expected to perform after hiring.
- Duties may appear in dedicated sections or unstructured text.
- Do not classify knowledge, experience, proficiency,
  eligibility, or personal traits as responsibilities.
- Do not treat interview activities, company descriptions,
  or course syllabuses as job responsibilities.
- Do not invent implied tasks.

REQUIREMENTS:
- Extract mandatory qualifications and hiring conditions only.
- Include explicitly required experience, education,
  proficiency, knowledge, eligibility, and professional traits.
- Preserve relevant proficiency levels, minimum years of
  experience, and mandatory constraints.
- Requirements may reference technologies also listed in skills.
- Do not include optional or preferred qualifications.
- Do not classify a duty as a requirement solely because
  it appears under a requirements heading.

PREFERRED QUALIFICATIONS:
- Extract only explicitly optional, advantageous,
  preferred, or nice-to-have qualifications.
- Preserve their original meaning and important conditions.
- Preferred technologies must also appear in skills when
  they are relevant job-related skills.
- Do not treat unqualified mandatory statements as preferred.

BENEFITS:
- Extract only explicitly offered employment benefits.
- Do not treat company history, achievements, or marketing
  descriptions as benefits.
- Do not invent benefits from general employment conditions.

WORK MODE:
- Use REMOTE only when remote work is explicitly stated.
- Use ONSITE only when onsite work is explicitly stated.
- Use HYBRID only when a combination of onsite and remote
  work is explicitly stated.
- Otherwise return null.
- Do not infer work mode from office address, working hours,
  full-time or part-time status.
- Full-time and part-time describe employment type,
  not work mode.

VISA SPONSORSHIP:
- Use AVAILABLE only when visa sponsorship is explicitly offered.
- Use NOT_AVAILABLE only when visa sponsorship is explicitly denied.
- Otherwise return null.
- Do not infer sponsorship from location, nationality,
  work eligibility, or relocation information.

CONFLICTING INFORMATION:
- If explicit statements contradict each other, do not
  arbitrarily select one.
- Return null for conflicting nullable scalar fields.
- Do not present disputed information as confirmed.

SEVERITY CALIBRATION:
- Missing a single non-critical employment benefit,
  such as flexible working hours, is normally minor.
- Missing a mandatory qualification or materially
  changing eligibility conditions is normally major.
- Reserve critical for errors that could seriously
  mislead candidates about eligibility, sponsorship,
  or other essential hiring conditions.
- Severity must reflect the impact of the defect,
  not merely the fact that information was omitted.

FINAL VALIDATION:
- Every extracted item must be supported by the source.
- Required and preferred qualifications must remain distinct.
- Skills must include both required and preferred job-related skills.
- Responsibilities must describe actual job duties.
- Do not penalize or remove valid cross-field overlap.
- Do not introduce information absent from the source.
- Follow the provided JSON schema exactly.

JOB DESCRIPTION:


${content}
    `;
  }
}
