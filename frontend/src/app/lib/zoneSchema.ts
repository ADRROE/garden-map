import { z } from "zod";

const SoilMixSchema = z
  .object({
    sand:    z.number().min(0).max(100),
    loam:    z.number().min(0).max(100),
    clay:    z.number().min(0).max(100),
    compost: z.number().min(0).max(100)
  })
  .refine(
    (mix) =>
      mix.sand + mix.loam + mix.clay + mix.compost === 100,
    {
      message: "Soil mix must add up to 100 %",
      path: []            // <- attaches error to the object itself
    }
  );

export type SoilMix = z.infer<typeof SoilMixSchema>;

export function isSoilMix(value: unknown): value is SoilMix {
  return SoilMixSchema.safeParse(value).success;
}

export const zoneSchema = z.object({
  displayName: z.string().min(1),

  // --- environmental props ----------
  ph:        z.number().min(0).max(14).optional(),
  temp:      z.number().gte(-273.15).optional(),   // °C
  moisture:  z.number().optional(),
  sunshine:  z.number().optional(),
  compaction:z.number().optional(),

  // --- water / amendment -------------
  tWatered:  z.coerce.date().optional(),
  qWatered:  z.number().optional(),
  tAmended:  z.coerce.date().optional(),
  qAmended:  z.number().optional(),

  // --- new soil mix ------------------
  soilMix:   SoilMixSchema.optional()
});

export type ZoneFormData = z.infer<typeof zoneSchema>;