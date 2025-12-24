import { z } from "zod";

export const ToolCallSchema = z.object({
  name: z.string(),
  arguments: z.record(z.any()).default({})
});
