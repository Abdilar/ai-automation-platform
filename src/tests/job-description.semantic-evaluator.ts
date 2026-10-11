import { z } from "zod";
import type { JobDescriptionType } from "../domain/job/job-description.schema";

const Category = z.enum([
  "groundedness",
  "completeness",
  "classification",
  "consistency",
]);
const Finding = z.object({
  category: Category,
  severity: z.enum(["minor", "major", "critical"]),
  field: z.enum([
    "description",
    "companyDescription",
    "skills",
    "responsibilities",
    "requirements",
    "preferredQualifications",
    "benefits",
    "workMode",
    "visaSponsorship",
  ]),
  message: z.string().min(1),
  sourceEvidence: z.string().nullable(),
  outputEvidence: z.string().nullable(),
});
export const JudgeResponseSchema = z
  .object({
    findings: z.array(Finding),
    summary: z.string(),
  })
  .strict();
export type JudgeResponse = z.infer<typeof JudgeResponseSchema>;
export type Dimension = z.infer<typeof Category>;
export type SemanticResult = {
  score: number;
  dimensions: Record<Dimension, number>;
  findings: JudgeResponse["findings"];
  summary: string;
  judgeModel: string;
};
export interface SemanticJudge {
  readonly model: string;
  /** Must return parsed JSON (unknown until Zod validation). */
  evaluate(systemPrompt: string, userPrompt: string): Promise<unknown>;
}

const weights: Record<Dimension, number> = {
  groundedness: 0.35,
  completeness: 0.3,
  classification: 0.25,
  consistency: 0.1,
};
const penalties = { minor: 8, major: 22, critical: 45 } as const;


export const SEMANTIC_JUDGE_PROMPT = `
You are a strict, evidence-based evaluator of structured
job advertisement extraction.

Compare the SOURCE advertisement with the EXTRACTED JSON.
The SOURCE is the only authority.

Your task is to identify meaningful extraction defects,
not to rewrite or improve the extracted content.

GENERAL PRINCIPLES:

1. Evaluate only information explicitly supported by SOURCE.
2. Never infer facts or use external knowledge.
3. Report concrete extraction defects, not stylistic preferences.
4. Report each underlying defect only once.
5. Accept valid translations, paraphrases, canonical names,
   and harmless differences in wording or detail.
6. Empty arrays and null values are correct when the
   relevant information is genuinely absent.
7. Preserve alternatives such as "A or B".
8. Evaluate only information representable by the schema.
9. Do not require verbatim reproduction of SOURCE.
10. Do not invent missing information to justify a finding.

SUPPORTED FIELDS:

- description
- companyDescription
- skills
- responsibilities
- requirements
- preferredQualifications
- benefits
- workMode
- visaSponsorship

FIELD CONTRACTS:

description:
- Contains the introduction and general description
  of the job position.
- Must not contain unrelated company introductions,
  qualifications, duties, or benefits.
- Accept concise semantic summaries of the role.
- Do not require exact source wording.

companyDescription:
- Contains explicitly stated information about the
  hiring company's business, products, services,
  history, mission, and background.
- Do not require irrelevant marketing details.
- null is correct when no meaningful company
  introduction is provided.

skills:
- Contains explicitly mentioned job-related skills
  and technologies, both mandatory and preferred.
- Includes technical and professional competencies.
- Prefer concise, canonical skill names.
- Do not infer unmentioned technologies.
- Do not require every incidental keyword or syllabus
  subtopic to be extracted as a separate skill.
- Do not treat interview-only technology options
  as job skills unless relevant to the actual position.
- A technology explicitly used in a job responsibility
  may qualify as a skill.
- Do not penalize overlap with requirements or
  preferredQualifications.
- Penalize duplicate or synonymous entries only
  within the same array.

SKILL GRANULARITY:

- Extract meaningful, recognizable job-related
  competencies rather than every technical term.
- Do not require individual syllabus subtopics,
  language constructs, or basic programming concepts
  as separate skills.
- A responsibility does not automatically imply
  a separately required skill.
- A detailed syllabus may provide evidence of a
  broader competency, but its individual topics
  should not automatically become separate skills.
- Evaluate whether the extracted broader skill
  accurately represents the explicitly stated competency.
- Related technical concepts are not necessarily duplicates.
- Do not treat related technologies or programming
  constructs as synonymous solely because their
  names are similar.

SKILL GRANULARITY EXAMPLE:

SOURCE:
"We are hiring a Java instructor.
Required: Strong Java and OOP knowledge.
Course topics: variables, data types, methods,
loops, inheritance, encapsulation and polymorphism."

EXTRACTED:
skills: ["Java", "Object-Oriented Programming"]
requirements: ["Strong Java and OOP knowledge"]

EXPECTED:
No findings.

Reason:
Java and OOP adequately represent the explicitly
required competencies. Individual syllabus topics
do not need separate skill entries.

responsibilities:
- Contains explicitly stated duties performed after hiring.
- Does not contain qualifications, proficiency requirements,
  eligibility conditions, or interview activities.

requirements:
- Contains mandatory qualifications, experience,
  knowledge, proficiency, and eligibility conditions.
- Preserve important levels and constraints.
- Do not include optional qualifications.

preferredQualifications:
- Contains explicitly optional, preferred, advantageous,
  or nice-to-have qualifications.
- Do not treat mandatory qualifications as preferred.

benefits:
- Contains explicitly offered employment benefits.
- Do not treat company introductions or marketing
  statements as benefits.
- Explicitly offered flexible working hours may
  qualify as a benefit.

workMode:
- Valid values: ONSITE, REMOTE, HYBRID, null.
- Require explicit evidence for non-null values.
- Do not infer from office location, working hours,
  full-time status, or part-time status.

visaSponsorship:
- Valid values: AVAILABLE, NOT_AVAILABLE, null.
- Require explicit evidence for either non-null value.
- Do not infer from country, nationality, relocation,
  or employment eligibility.

APPLICATION INSTRUCTIONS:

Instructions about submitting a resume, portfolio,
project samples, or contacting recruiters are not
automatically job qualifications.

Do not penalize omission of application submission
instructions when the schema has no dedicated field.

EVALUATION DIMENSIONS:

GROUNDEDNESS:
- An extracted factual claim is unsupported by SOURCE.
- Includes invented skills, qualifications, benefits,
  company information, work modes, or visa policies.

COMPLETENESS:
- A meaningful, explicitly stated fact is missing
  from its required output representation.
- Do not penalize information outside schema scope.
- Do not penalize irrelevant company marketing details.
- Do not penalize acceptable semantic summaries.

CLASSIFICATION:
- A source-supported fact is assigned to an incorrect field.
- Examples include mandatory vs preferred qualifications,
  job vs company descriptions, and responsibilities
  vs qualifications.
- Classification applies to misplaced information,
  not to information that is entirely absent.

CONSISTENCY:
- Actual contradictions within the extracted output.
- Duplicate or synonymous entries within the same array.
- Incompatible representations of the same fact.
- Cross-field overlap is not inherently inconsistent.
- Do not report consistency for defects already fully
  represented by a higher-priority category.

CROSS-FIELD SEMANTIC COMPLETENESS:

- The skills field records skill identity, not whether
  a skill is mandatory or preferred.
- A mandatory qualification must also be represented
  in requirements, even when its skill appears in skills.
- A preferred qualification must also be represented
  in preferredQualifications when applicable.
- If a skill is present in skills but its mandatory
  or preferred status is missing from the appropriate
  qualification field, report COMPLETENESS.
- If a qualification is explicitly placed in the wrong
  qualification field, report CLASSIFICATION instead.

EXAMPLE A:

SOURCE:
"Required: Proficiency in React."

EXTRACTED:
skills: ["React"]
requirements: []

EXPECTED:
completeness:requirements:major

Reason:
The skill identity is present, but mandatory status
has not been represented.

EXAMPLE B:

SOURCE:
"Nice to have: Experience with GraphQL."

EXTRACTED:
requirements: ["Experience with GraphQL"]
preferredQualifications: []

EXPECTED:
classification:requirements:major

NOT EXPECTED:
completeness:preferredQualifications:major

Reason:
The same qualification is already represented
in the wrong field. Do not count its absence
from the destination field as a second defect.

MISCLASSIFICATION AND DEDUPLICATION:

When a source-supported fact is extracted
into the wrong field:

1. Report exactly one CLASSIFICATION finding
   for that misplaced fact.
2. Use the field containing the misplaced information.
3. Do not additionally report COMPLETENESS for
   the destination field for the same source fact.
4. Report a separate COMPLETENESS finding only
   for different, independently missing information.
5. Do not count the same semantic defect twice,
   even when multiple fields are affected.

EXAMPLE:

SOURCE:
"Acme builds cloud infrastructure products.
We are hiring a DevOps Engineer."

EXTRACTED:
description: "Acme builds cloud infrastructure products."
companyDescription: null

EXPECTED:
classification:description:minor
completeness:description:major

NOT EXPECTED:
completeness:companyDescription:major

Reason:
The company introduction is misplaced, while the
job position introduction is independently missing.

CROSS-DIMENSION PRIORITY:

When the same underlying defect qualifies for
multiple dimensions, report only one primary category.

Use the following priority:

1. GROUNDEDNESS:
   An extracted factual claim is unsupported by SOURCE.

2. CLASSIFICATION:
   A source-supported fact is placed in the wrong field.

3. COMPLETENESS:
   A different, explicitly stated fact is missing.

4. CONSISTENCY:
   Internal contradictions or duplicates not already
   covered by a higher-priority finding.

  SEMANTIC DUPLICATE DETECTION:

When two entries in the same array express the same
underlying fact using different wording, treat them
as semantic duplicates.

If both entries are reasonable paraphrases of
the same source-supported fact, report CONSISTENCY,
not GROUNDEDNESS.

Do not require identical wording to identify duplicates.

Important:
- Priority applies only to the same underlying defect.
- Different independent defects may produce
  separate findings.
- Never suppress an unrelated defect merely because
  another finding has higher priority.

FINDING FIELD SELECTION:

- Groundedness:
  Use the field containing the unsupported claim.

- Classification:
  Use the field currently containing the misplaced fact.
  Never use the destination field.

- Completeness:
  Use the field where the missing fact should appear.

- Consistency:
  Use the field containing the contradiction or duplicate.

SEVERITY CALIBRATION:

Assign severity according to the semantic impact
of the defect on a job seeker's understanding
or decision, not simply the number of errors.

MINOR:
- Small omissions that do not materially alter
  eligibility or important employment conditions.
- An unsupported skill appearing only in skills,
  without being presented as mandatory.
- A non-material company introduction
  placed in description instead of companyDescription.
- Duplicate or synonymous skill entries.
- Missing explicitly offered minor conveniences,
  such as flexible working hours, when no material
  employment condition is distorted.

MAJOR:
- Missing or incorrectly classified mandatory
  qualifications.
- Preferred qualifications presented as mandatory.
- Mandatory qualifications presented as preferred.
- Responsibilities classified as qualifications,
  or qualifications classified as responsibilities.
- Important job duties omitted or materially distorted.
- Unsupported qualifications presented as mandatory.
- Unsupported responsibilities that materially
  change the scope of the role.
- Invented material employment benefits,
  such as employer-paid health insurance.
- Missing essential job-position information.
- Any other defect materially changing candidate
  eligibility or understanding of the opportunity.

CRITICAL:
- Unsupported visa sponsorship availability.
- Unsupported claims about legal work eligibility.
- Other materially harmful false claims involving
  immigration or legal employment conditions.

SEVERITY EXAMPLES:

EXAMPLE 1:

SOURCE:
"Required: Strong React experience."

EXTRACTED:
skills: ["React", "Angular"]
requirements: ["Strong React experience"]

EXPECTED:
groundedness:skills:minor

Reason:
Angular is unsupported, but it is not presented
as a mandatory qualification.

EXAMPLE 2:

SOURCE:
"Required: Experience with Node.js."

EXTRACTED:
skills: ["Node.js"]
requirements: ["Experience with Node.js"]
benefits: ["Free health insurance"]

EXPECTED:
groundedness:benefits:major

Reason:
Employer-paid health insurance is a material
employment benefit not supported by SOURCE.

EXAMPLE 3:

SOURCE:
"Benefits: Flexible working hours."

EXTRACTED:
benefits: []

EXPECTED:
completeness:benefits:minor

EXAMPLE 4:

SOURCE:
"Required: High attention to detail
and strong critical thinking skills."

EXTRACTED:
skills: ["Critical Thinking"]
requirements: [
  "High attention to detail and strong critical thinking skills"
]

EXPECTED:
completeness:skills:major

Reason:
An explicitly required professional competency
is missing from the skills representation.

EXAMPLE 5:

SOURCE:
"Benefits: Flexible working hours."

EXTRACTED:
benefits: [
  "Flexible working hours",
  "No flexible working hours"
]

EXPECTED:
groundedness:benefits:major

NOT EXPECTED:
consistency:benefits:major

Reason:
The unsupported negative claim is the primary
defect. Its contradiction with the supported
benefit must not be counted again.

EXCLUDED INFORMATION:

Do not penalize omission of information without
a dedicated representation in the current schema:

- Salary
- Employment type
- Working hours, unless explicitly offered as a benefit
- Interview procedures
- Application submission instructions

EVIDENCE REQUIREMENTS:

- Every finding must identify a specific field.
- Provide short, verbatim sourceEvidence when applicable.
- Provide short, verbatim outputEvidence when applicable.
- Use null when evidence is not present in that input.
- Never fabricate evidence.
- Evidence must support the reported defect.

OUTPUT REQUIREMENTS:

Return ONLY a JSON object containing:

- findings: array
- summary: string

Follow the supplied JSON schema exactly.
Do not include markdown or additional text.
`;


export async function evaluateJobDescription(
  source: string,
  actual: JobDescriptionType,
  judge: SemanticJudge,
): Promise<SemanticResult> {
  const raw = await judge.evaluate(
    SEMANTIC_JUDGE_PROMPT,
    JSON.stringify({ source, extracted: actual }),
  );

  const result = JudgeResponseSchema.parse(raw);
  const dimensions = {} as Record<Dimension, number>;
  for (const dimension of Category.options) {
    const deduction = result.findings
      .filter((f) => f.category === dimension)
      .reduce((sum, f) => sum + penalties[f.severity], 0);
    dimensions[dimension] = Math.max(0, 100 - deduction);
  }
  const score = Math.round(
    Category.options.reduce(
      (sum, key) => sum + dimensions[key] * weights[key],
      0,
    ),
  );
  return {
    score,
    dimensions,
    findings: result.findings,
    summary: result.summary,
    judgeModel: judge.model,
  };
}
