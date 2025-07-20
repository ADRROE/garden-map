import { z } from "zod";
import { optionalNumberWithConstraints, optionalString } from "./zodUtils";


export const itemSchema = z.object({
    rhsId: optionalString(z.string().min(1).max(6)),
    wcvpId: optionalString(z.string().min(1).max(8)),
    displayName: z.string().min(1),
    species: optionalString(z.string().min(1)),
    genus: optionalString(z.string().min(1)),
    price: optionalNumberWithConstraints(z.number().min(0)),
    tAmended: z.coerce.date().optional(),
    tHarvested: z.coerce.date().optional(),
    tWatered: z.coerce.date().optional(),
    tPruned: z.coerce.date().optional(),
    dateStatus: z.coerce.date().optional(),
    fertilizerType: optionalString(z.string().min(1)),
    pruneType: optionalString(z.string().min(1)),
    plantForm: optionalString(z.string().min(1)),
    status: optionalString(z.string().min(1)),
    circumference: optionalNumberWithConstraints(z.number().min(0)),
});

export type ItemFormData = z.infer<typeof itemSchema>;