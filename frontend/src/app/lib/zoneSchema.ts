import { z } from "zod";

export const zoneSchema = z.object({
    displayName: z.string().min(1),
    ph: z.number().min(0).max(14),
    temp: z.number().gte(-273.15),
    fertDate: z.coerce.date(),
    waterDate: z.coerce.date(),
    waterAmount: z.number(),
    fertType: z.string(),
    soilMix: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
    moisture: z.number(),
    sunshine: z.number(),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;