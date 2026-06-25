import { z } from "zod";

export const changePlanSchema = z.object({
  planCode: z.enum(["free", "starter", "pro", "enterprise"]),
});

export type ChangePlanInput = z.infer<typeof changePlanSchema>;
