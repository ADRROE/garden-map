import { ItemFormData } from "./itemSchema";
import { ZoneFormData } from "./zoneSchema";

type FieldType = "text" | "number" | "date" | "SoilMix";

type BaseFieldConfigItem = {
  labelKey: string;
  type: FieldType;
  unit?: string;
  readOnly?: boolean;
};

type ItemFieldConfigItem = BaseFieldConfigItem & {
  name: keyof ItemFormData;
};

type ZoneFieldConfigItem = BaseFieldConfigItem & {
  name: keyof ZoneFormData;
};

export type FieldConfigItem = ItemFieldConfigItem | ZoneFieldConfigItem;

export const fieldConfig: FieldConfigItem[] = [
  { name: "rhsId", labelKey: "rhsId", type: "text", readOnly: false },
  { name: "wcvpId", labelKey: "wcvpId", type: "text", readOnly: false },
  { name: "displayName", labelKey: "displayName", type: "text", readOnly: false },
  { name: "displaySpecies", labelKey: "displaySpecies", type: "text", readOnly: false },
  { name: "displayGenus", labelKey: "displayGenus", type: "text", readOnly: false },
  { name: "price", labelKey: "price", type: "number", unit: "€", readOnly: false },
  { name: "ph", labelKey: "ph", type: "number", readOnly: true },
  { name: "temp", labelKey: "temp", type: "number", unit: "°C", readOnly: true },
  { name: "tAmended", labelKey: "tAmended", type: "date", readOnly: false },
  { name: "tHarvested", labelKey: "tHarvested", type: "date", readOnly: false },
  { name: "tWatered", labelKey: "tWatered", type: "date", readOnly: false },
  { name: "qWatered", labelKey: "qWatered", type: "number", unit: "l", readOnly: false },
  { name: "tPruned", labelKey: "tPruned", type: "date", readOnly: false },
  { name: "fertilizerType", labelKey: "fertilizerType", type: "text", readOnly: false },
  { name: "plantForm", labelKey: "plantForm", type: "text", readOnly: false },
  { name: "status", labelKey: "status", type: "text", readOnly: false },
  { name: "circumference", labelKey: "circumference", type: "number", unit: "cm", readOnly: false },
  { name: "soilMix", labelKey: "soilMix", type: "SoilMix", readOnly: false },
  { name: "moisture", labelKey: "moisture", type: "number", unit: "%", readOnly: true },
  { name: "sunshine", labelKey: "sunshine", type: "number", unit: "lux/hr", readOnly: true },
] as const;