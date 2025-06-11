import { ElementFormData } from "./elementSchema";
import { ZoneFormData } from "./zoneSchema";

type FieldType = "text" | "number" | "date" | "ratio";

type BaseFieldConfigItem = {
  labelKey: string;
  type: FieldType;
  unit?: string;
  readOnly?: boolean;
};

type ElementFieldConfigItem = BaseFieldConfigItem & {
  name: keyof ElementFormData;
};

type ZoneFieldConfigItem = BaseFieldConfigItem & {
  name: keyof ZoneFormData;
};

export type FieldConfigItem = ElementFieldConfigItem | ZoneFieldConfigItem;

export const fieldConfig: readonly FieldConfigItem[] = [
  { name: "rhsId", labelKey: "rhsId", type: "text", readOnly: false },
  { name: "wcvpId", labelKey: "wcvpId", type: "text", readOnly: false },
  { name: "displayName", labelKey: "displayName", type: "text", readOnly: false },
  { name: "displaySpecies", labelKey: "displaySpecies", type: "text", readOnly: false },
  { name: "displayGenus", labelKey: "displayGenus", type: "text", readOnly: false },
  { name: "price", labelKey: "price", type: "number", unit: "€", readOnly: false },
  { name: "ph", labelKey: "ph", type: "number", readOnly: true },
  { name: "temp", labelKey: "temp", type: "number", unit: "°C", readOnly: true },
  { name: "datePlanted", labelKey: "datePlanted", type: "date", readOnly: false },
  { name: "dateFertilized", labelKey: "dateFertilized", type: "date", readOnly: false },
  { name: "dateHarvested", labelKey: "dateHarvested", type: "date", readOnly: false },
  { name: "dateWatered", labelKey: "dateWatered", type: "date", readOnly: true },
  { name: "amountWatered", labelKey: "amountWatered", type: "number", unit: "l", readOnly: true },
  { name: "datePruned", labelKey: "datePruned", type: "date", readOnly: false },
  { name: "fertilizerType", labelKey: "fertilizerType", type: "text", readOnly: false },
  { name: "plantForm", labelKey: "plantForm", type: "text", readOnly: false },
  { name: "status", labelKey: "status", type: "text", readOnly: false },
  { name: "dateStatus", labelKey: "dateStatus", type: "date", readOnly: false },
  { name: "width", labelKey: "width", type: "number", unit: "cm", readOnly: false },
  { name: "height", labelKey: "height", type: "number", unit: "cm", readOnly: false },
  { name: "circumference", labelKey: "circumference", type: "number", unit: "cm", readOnly: false },
  { name: "soilMix", labelKey: "soilMix", type: "text", readOnly: false },
  { name: "moisture", labelKey: "moisture", type: "number", unit: "%", readOnly: true },
  { name: "sunshine", labelKey: "sunshine", type: "number", unit: "lux/hr", readOnly: true },
] as const;