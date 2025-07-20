import { z } from "zod";

export const optionalNumber = () =>
  z.preprocess(
    (val) => (val === "" || val == null || Number.isNaN(val) ? undefined : Number(val)),
    z.number().optional()
  );

export const optionalNumberWithConstraints = (schema: z.ZodNumber) =>
  z.preprocess(
    (val) =>
      val === "" || val == null || Number.isNaN(val) ? undefined : Number(val),
    schema.optional()
  );

export const optionalString = (schema: z.ZodString) =>
  z
    .union([z.string(), z.undefined()])
    .refine((val) => !val || schema.safeParse(val).success);