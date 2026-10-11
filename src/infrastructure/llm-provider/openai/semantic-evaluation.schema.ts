export const semanticEvaluationJsonSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['findings', 'summary'],
  properties: {
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'category',
          'severity',
          'field',
          'message',
          'sourceEvidence',
          'outputEvidence',
        ],
        properties: {
          category: {
            type: 'string',
            enum: [
              'groundedness',
              'completeness',
              'classification',
              'consistency',
            ],
          },
          severity: {
            type: 'string',
            enum: ['minor', 'major', 'critical'],
          },
          field: {
            type: 'string',
            enum: [
              'description',
              'companyDescription',
              'skills',
              'responsibilities',
              'requirements',
              'preferredQualifications',
              'benefits',
              'workMode',
              'visaSponsorship',
            ],
          },
          message: { type: 'string' },
          sourceEvidence: {
            type: ['string', 'null'],
          },
          outputEvidence: {
            type: ['string', 'null'],
          },
        },
      },
    },
    summary: { type: 'string' },
  },
} as const;