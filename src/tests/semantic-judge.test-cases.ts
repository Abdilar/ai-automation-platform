import type { JobDescriptionType } from "../domain/job/job-description.schema";

type Category =
  | "groundedness"
  | "completeness"
  | "classification"
  | "consistency";

type Severity = "minor" | "major" | "critical";

export interface JudgeTestCase {
  name: string;
  source: string;
  extracted: JobDescriptionType;
  expected: {
    findings: Array<{
      category: Category;
      field: keyof JobDescriptionType;
      severity: Severity;
    }>;
  };
}

const emptyExtraction: JobDescriptionType = {
  description: null,
  companyDescription: null,
  skills: [],
  responsibilities: [],
  requirements: [],
  preferredQualifications: [],
  benefits: [],
  workMode: null,
  visaSponsorship: null,
};

export const semanticJudgeTestCases: JudgeTestCase[] = [
  // 01 - Correct extraction: syllabus granularity
  {
    name: "01 - Java syllabus granularity",
    source: `
      We are hiring a Java instructor.
      Required: Strong Java and OOP knowledge.
      Course topics: variables, data types, methods,
      loops, inheritance, encapsulation and polymorphism.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Java instructor position",
      skills: ["Java", "Object-Oriented Programming"],
      requirements: ["Strong Java and OOP knowledge"],
    },
    expected: {
      findings: [],
    },
  },

  // 02 - Completeness: missing benefit
  {
    name: "02 - Missing flexible hours benefit",
    source: `
      We are hiring a QA Engineer.
      Benefits: Flexible working hours.
    `,
    extracted: {
      ...emptyExtraction,
      description: "QA Engineer position",
    },
    expected: {
      findings: [
        {
          category: "completeness",
          field: "benefits",
          severity: "minor",
        },
      ],
    },
  },

  // 03 - Completeness: missing mandatory qualification
  {
    name: "03 - Missing mandatory skill requirement",
    source: `
      We are hiring a Frontend Engineer.
      Required: Proficiency in React.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Frontend Engineer position",
      skills: ["React"],
    },
    expected: {
      findings: [
        {
          category: "completeness",
          field: "requirements",
          severity: "major",
        },
      ],
    },
  },

  // 04 - Groundedness: invented technology

  {
    name: "04 - Invented technical skill",
    source: `
    We are hiring a Frontend Engineer.
    Required: Strong React experience.
  `,
    extracted: {
      ...emptyExtraction,
      description: "Frontend Engineer position",
      skills: ["React", "Angular"],
      requirements: ["Strong React experience"],
    },
    expected: {
      findings: [
        {
          category: "groundedness",
          field: "skills",
          severity: "minor",
        },
      ],
    },
  },

  // 05 - Groundedness: invented benefit
  {
    name: "05 - Invented employment benefit",
    source: `
      We are hiring a Backend Engineer.
      Required: Experience with Node.js.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Backend Engineer position",
      skills: ["Node.js"],
      requirements: ["Experience with Node.js"],
      benefits: ["Free health insurance"],
    },
    expected: {
      findings: [
        {
          category: "groundedness",
          field: "benefits",
          severity: "major",
        },
      ],
    },
  },

  // 06 - Groundedness: invented visa sponsorship
  {
    name: "06 - Invented visa sponsorship",
    source: `
      We are hiring a Software Engineer.
      Required: Experience with Python.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Software Engineer position",
      skills: ["Python"],
      requirements: ["Experience with Python"],
      visaSponsorship: "AVAILABLE",
    },
    expected: {
      findings: [
        {
          category: "groundedness",
          field: "visaSponsorship",
          severity: "critical",
        },
      ],
    },
  },

  // 07 - Completeness: missing professional competency
  {
    name: "07 - Missing attention to detail skill",
    source: `
      We are hiring a QA Engineer.
      Required: High attention to detail and
      strong critical thinking skills.
    `,
    extracted: {
      ...emptyExtraction,
      description: "QA Engineer position",
      skills: ["Critical Thinking"],
      requirements: ["High attention to detail and strong critical thinking"],
    },
    expected: {
      findings: [
        {
          category: "completeness",
          field: "skills",
          severity: "major",
        },
      ],
    },
  },

  // 08 - Classification: preferred vs required
  {
    name: "08 - Preferred qualification classified as required",
    source: `
      We are hiring a Backend Engineer.
      Required: Node.js experience.
      Nice to have: Experience with GraphQL.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Backend Engineer position",
      skills: ["Node.js", "GraphQL"],
      requirements: ["Node.js experience", "Experience with GraphQL"],
    },
    expected: {
      findings: [
        {
          category: "classification",
          field: "requirements",
          severity: "major",
        },
      ],
    },
  },

  // 09 - Classification: company information in job description

  {
    name: "09 - Company introduction misclassified",
    source: `
    Acme builds cloud infrastructure products
    for enterprise customers.
    We are hiring a DevOps Engineer.
  `,
    extracted: {
      ...emptyExtraction,
      description:
        "Acme builds cloud infrastructure products for enterprise customers.",
      companyDescription: null,
    },
    expected: {
      findings: [
        {
          category: "classification",
          field: "description",
          severity: "minor",
        },
        {
          category: "completeness",
          field: "description",
          severity: "major",
        },
      ],
    },
  },

  // 10 - Classification: duty classified as qualification
  {
    name: "10 - Responsibility classified as requirement",
    source: `
      We are hiring a Data Analyst.
      Responsibilities: Prepare weekly business reports.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Data Analyst position",
      requirements: ["Prepare weekly business reports"],
    },
    expected: {
      findings: [
        {
          category: "classification",
          field: "requirements",
          severity: "major",
        },
      ],
    },
  },

  // 11 - Consistency: duplicate skills
  {
    name: "11 - Duplicate skill entries",
    source: `
      We are hiring a Frontend Engineer.
      Required: React experience.
    `,
    extracted: {
      ...emptyExtraction,
      description: "Frontend Engineer position",
      skills: ["React", "React.js"],
      requirements: ["React experience"],
    },
    expected: {
      findings: [
        {
          category: "consistency",
          field: "skills",
          severity: "minor",
        },
      ],
    },
  },

  // 12 - Consistency: contradictory qualification status

  {
    name: "12 - Unsupported contradictory benefit",
    source: `
    We are hiring a Backend Engineer.
    Benefits: Flexible working hours.
  `,
    extracted: {
      ...emptyExtraction,
      description: "Backend Engineer position",
      benefits: ["Flexible working hours", "No flexible working hours"],
    },
    expected: {
      findings: [
        {
          category: "groundedness",
          field: "benefits",
          severity: "major",
        },
      ],
    },
  },

  {
    name: "13 - Duplicate benefit entries",
    source: `
    We are hiring a Backend Engineer.
    Benefits: Flexible working hours.
  `,
    extracted: {
      ...emptyExtraction,
      description: "Backend Engineer position",
      benefits: ["Flexible working hours", "Flexible work schedule"],
    },
    expected: {
      findings: [
        {
          category: "consistency",
          field: "benefits",
          severity: "minor",
        },
      ],
    },
  },
];
