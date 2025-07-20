import { z } from "zod";
import { optionalNumber, optionalNumberWithConstraints } from "./zodUtils";

const SoilMixSchema = z
  .object({
    sand: optionalNumberWithConstraints(z.number().min(0).max(100)),
    silt: optionalNumberWithConstraints(z.number().min(0).max(100)),
    clay: optionalNumberWithConstraints(z.number().min(0).max(100)),
  })
  .refine(
    (mix) => {
      if (
        mix.sand == null &&
        mix.silt == null &&
        mix.clay == null
      ) {
        return true; // valid: entire soilMix is undefined/empty
      }
      return (
        (mix.sand ?? 0) +
          (mix.silt ?? 0) +
          (mix.clay ?? 0) === 100
      );
    },
    {
      message: "Soil mix must add up to 100 %",
      path: [], // attach to object-level
    }
  );

export type SoilMix = z.infer<typeof SoilMixSchema>;

export function isSoilMix(value: unknown): value is SoilMix {
  return SoilMixSchema.safeParse(value).success;
}

export const zoneSchema = z.object({
  displayName: z.string().min(1),

  // --- environmental props ----------
  ph:        optionalNumberWithConstraints(z.number().min(0).max(14)),
  temp:      optionalNumberWithConstraints(z.number().gte(-273.15)),   // °C
  moisture:  optionalNumber(),
  sunshine:  optionalNumber(),
  compaction:optionalNumber(),

  // --- water / amendment -------------
  tWatered:  z.coerce.date().optional(),
  dtWatered: optionalNumber(),
  qWatered:  optionalNumber(),
  tAmended:  z.coerce.date().optional(),
  qAmended:  optionalNumber(),

  // --- new soil mix ------------------
  soilMix:   SoilMixSchema.optional()
});

export type ZoneFormData = z.infer<typeof zoneSchema>;