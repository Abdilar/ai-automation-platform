import { z } from "zod";

export const JobDescriptionSchema = z.object({
  description: z.string().nullable(),
  companyDescription: z.string().nullable(),
  skills: z.array(z.string()),
  responsibilities: z.array(z.string()),
  requirements: z.array(z.string()),
  preferredQualifications: z.array(z.string()),
  benefits: z.array(z.string()),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]).nullable(),
  visaSponsorship: z.enum(["AVAILABLE", "NOT_AVAILABLE"]).nullable(),
});

export type JobDescriptionType = z.infer<
  typeof JobDescriptionSchema
>;