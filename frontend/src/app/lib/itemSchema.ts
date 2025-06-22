import { z } from "zod";

export const itemSchema = z.object({
    rhsId: z.string().min(1).max(6),
    wcvpId: z.string().min(1).max(8),
    displayName: z.string().min(1),
    displaySpecies: z.string().min(1),
    displayGenus: z.string().min(1),
    price: z.number(),
    tAmended: z.coerce.date(),
    tHarvested: z.coerce.date(),
    tWatered: z.coerce.date(),
    tPruned: z.coerce.date(),
    dateStatus: z.coerce.date(),
    qWatered: z.number(),
    fertilizerType: z.string(),
    pruneType: z.string(),
    plantForm: z.string(),
    status: z.string(),
    circumference: z.number(),
});

export type ItemFormData = z.infer<typeof itemSchema>;