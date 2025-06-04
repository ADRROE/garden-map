import { z } from "zod";

export const elementSchema = z.object({
    rhsId: z.string().min(1).max(6),
    wcvpId: z.string().min(1).max(8),
    displayName: z.string().min(1),
    species: z.string().min(1),
    genus: z.string().min(1),
    price: z.number(),
    ph: z.number().min(0).max(14),
    temp: z.number().gte(-273.15),
    plantDate: z.coerce.date(),
    fertDate: z.coerce.date(),
    harvestDate: z.coerce.date(),
    waterDate: z.coerce.date(),
    pruneDate: z.coerce.date(),
    statusDate: z.coerce.date(),
    waterAmount: z.number(),
    fertType: z.string(),
    pruneType: z.string(),
    form: z.string(),
    status: z.string(),
    width: z.number(),
    height: z.number(),
    circumference: z.number(),
    mix: z.string().regex(/^\d{2}:\d{2}:\d{2}$/),
    moisture: z.number(),
    luxHr: z.number(),
});

export type ElementFormData = z.infer<typeof elementSchema>;