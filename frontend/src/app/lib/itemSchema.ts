import { z } from "zod";

export const itemSchema = z.object({
    rhsId: z.string().min(1).max(6).optional(),
    wcvpId: z.string().min(1).max(8).optional(),
    displayName: z.string().min(1),
    displaySpecies: z.string().min(1).optional(),
    displayGenus: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    tAmended: z.coerce.date().optional(),
    tHarvested: z.coerce.date().optional(),
    tWatered: z.coerce.date().optional(),
    tPruned: z.coerce.date().optional(),
    dateStatus: z.coerce.date().optional(),
    fertilizerType: z.string().min(1).optional(),
    pruneType: z.string().min(1).optional(),
    plantForm: z.string().min(1).optional(),
    status: z.string().min(1).optional(),
    circumference: z.number().min(0).optional(),
});

export type ItemFormData = z.infer<typeof itemSchema>;