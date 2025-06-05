import { ElementFormData } from "./elementSchema";

type FieldType = "text" | "number" | "date" | "ratio";

export type FieldConfigItem = {
  name: keyof ElementFormData;
  labelKey: string;
  type: FieldType;
  unit?: string;
};

export const fieldConfig: readonly FieldConfigItem[] = [
  { name: "rhsId", labelKey: "rhsId", type: "text" },
  { name: "wcvpId", labelKey: "wcvpId", type: "text" },
  { name: "displayName", labelKey: "displayName", type: "text" },
  { name: "species", labelKey: "species", type: "text" },
  { name: "genus", labelKey: "genus", type: "text" },
  { name: "price", labelKey: "price", type: "number", unit: "€" },
  { name: "ph", labelKey: "ph", type: "number" },
  { name: "temp", labelKey: "temp", type: "number", unit: "°C" },
  { name: "plantDate", labelKey: "plantDate", type: "date" },
  { name: "fertDate", labelKey: "fertDate", type: "date" },
  { name: "harvestDate", labelKey: "harvestDate", type: "date" },
  { name: "waterDate", labelKey: "waterDate", type: "date" },
  { name: "waterAmount", labelKey: "waterAmount", type: "number" },
  { name: "pruneDate", labelKey: "pruneDate", type: "date" },
  { name: "fertType", labelKey: "fertType", type: "text" },
  { name: "plantForm", labelKey: "plantForm", type: "text" },
  { name: "status", labelKey: "status", type: "text" },
  { name: "statusDate", labelKey: "statusDate", type: "date" },
  { name: "width", labelKey: "width", type: "number", unit: "cm" },
  { name: "height", labelKey: "height", type: "number", unit: "cm" },
  { name: "circumference", labelKey: "circumference", type: "number", unit: "cm" },
  { name: "mix", labelKey: "mix", type: "text" }, // assuming this gets special handling
  { name: "moisture", labelKey: "moisture", type: "number", unit: "%" },
  { name: "luxHr", labelKey: "luxHr", type: "number", unit: "lux" },
] as const;