import { z } from "zod";

export const itemSchema = z.object({
    rhsId: z.string().min(1).max(6),
    wcvpId: z.string().min(1).max(8),
    displayName: z.string().min(1),
    displaySpecies: z.string().min(1),
    displayGenus: z.string().min(1),
    price: z.number(),
    datePlanted: z.coerce.date(),
    dateFertilized: z.coerce.date(),
    dateHarvested: z.coerce.date(),
    dateWatered: z.coerce.date(),
    datePruned: z.coerce.date(),
    dateStatus: z.coerce.date(),
    amountWatered: z.number(),
    fertilizerType: z.string(),
    pruneType: z.string(),
    plantForm: z.string(),
    status: z.string(),
    width: z.number(),
    height: z.number(),
    circumference: z.number(),
});

export type ItemFormData = z.infer<typeof itemSchema>;