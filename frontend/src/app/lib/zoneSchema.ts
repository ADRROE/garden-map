import { z } from "zod";

export const zoneSchema = z.object({
    displayName: z.string().min(1),
    ph: z.number().min(0).max(14),
    temp: z.number().gte(-273.15),
    tAmended: z.coerce.date(),
    tWatered: z.coerce.date(),
    qWatered: z.number(),
    qAmended: z.number(),
    soilMix: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
    moisture: z.number(),
    sunshine: z.number(),
});

export type ZoneFormData = z.infer<typeof zoneSchema>;