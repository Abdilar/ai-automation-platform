import { JobDescription } from "./job-description.schema";

export interface IJobDescriptionExtractor {
  extract(content: string): Promise<JobDescription>;
}
