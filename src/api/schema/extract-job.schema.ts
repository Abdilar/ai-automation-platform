import { z } from "zod";

export const ExtractJobRequestSchema = z.object({
  text: z.string().trim().min(1).max(100_000),
});

export type ExtractJobRequestType = z.infer<typeof ExtractJobRequestSchema>;
