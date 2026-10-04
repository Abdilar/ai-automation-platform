import { z } from "zod";

export const JobDescriptionSchema = z.object({
  description: z.string().optional(),
  skills: z.array(z.string()).default([]),
  responsibilities: z.array(z.string()).default([]),
  requirements: z.array(z.string()).default([]),
  preferredQualifications: z.array(z.string()).default([]),
  benefits: z.array(z.string()).default([]),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]).optional(),
  visaSponsorship: z.enum(["AVAILABLE", "NOT_AVAILABLE", "UNKNOWN"]).optional(),
});
