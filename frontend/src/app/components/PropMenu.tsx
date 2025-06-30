"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import Draggable from 'react-draggable'
import React, { forwardRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemFormData } from "@/lib/itemSchema";
import { FieldConfigItem } from "@/lib/fieldConfig";
import { isSoilMix, ZoneFormData, zoneSchema } from "@/lib/zoneSchema";
import { itemSchema } from "@/lib/itemSchema";
import { cn } from "@/utils/utils";
import { z } from "zod";

export interface PropMenuProps {
  fields: FieldConfigItem[];
  formData: (Partial<ItemFormData> & Partial<ZoneFormData>) & { id: string; name?: string; };
  isMaplocked: boolean;
  onUpdate: (updated: ItemFormData | ZoneFormData & { id: string }) => void;
  onClose: () => void;
}

const PropMenu = forwardRef<HTMLDivElement, PropMenuProps>(({
  fields,
  formData,
  isMaplocked,
  onUpdate,
  onClose,
}, ref) => {
  const combinedSchema = zoneSchema.merge(itemSchema);
  const formSchema = combinedSchema.partial()
  type FormShape = z.infer<typeof formSchema>;

  const t = useTranslations('PropMenu');

  const applicableFields = fields.filter(field => field.name in formData);
  const readOnlyFields = applicableFields.filter(f => f.readOnly);
  const editableFields = applicableFields.filter(f => !f.readOnly);
  const editableFieldNames = fields
    .filter((f) => !f.readOnly)
    .map((f) => f.name as keyof FormShape);

  const filteredDefaults: Partial<FormShape> = Object.fromEntries(
    Object.entries(formData)
      .filter(([key]) => editableFieldNames.includes(key as keyof FormShape))
      .map(([key, value]) => [key as keyof FormShape, value])
  );

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormShape>({ resolver: zodResolver(formSchema), mode: 'onChange', defaultValues: filteredDefaults })


  const getInputValue = (key: string): string => {
    const raw = formData[key as keyof typeof formData];
    if (raw instanceof Date) return raw.toISOString().split("T")[0];
    if (typeof raw === "number") return raw.toFixed(2);
    if (isSoilMix(raw)) {
      // Convert SoilMix to a compact string like "sand:25,silt:25,..."
      return Object.entries(raw)
        .map(([type, value]) => `${type}:${value}`)
        .join(", ");
    }
    return raw ?? "";
  };

  const onSubmit = (data: Partial<ItemFormData & ZoneFormData>) => {
    console.log("✅ Submitted data:", data);
    console.log("📤 Calling onUpdate");
    onUpdate({ id: formData.id, ...(data as ItemFormData & ZoneFormData) });
    onClose();
  };

  // useEffect(() => reset(formData), [formData, reset]);

  return (
    <div ref={ref} className="right-4 top-4 w-64 bg-white shadow-lg p-4 border z-50 rounded mb-1 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between mb-4 prop-menu-header">
        <h2 className="text-lg text-black font-semibold">{formData.displayName}</h2>
        <button onClick={onClose} className="text-gray-900 hover:text-black">✕</button>
      </div>

      {readOnlyFields.length > 0 && (
        <div className="mb-4">
          {readOnlyFields.map((field) => (
            <div key={field.name} className="mb-1">
              <div className="text-xs text-gray-500">
                {t(field.labelKey)} {field.unit && `(${field.unit})`}
              </div>
              <div className="text-sm text-gray-800 font-medium">
                {getInputValue(field.name)}
              </div>
            </div>
          ))}
          <hr className="my-2 border-gray-200" />
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit, (err) => {
        console.log("⛔ Validation failed:", err);
      })}>
        {editableFields.map((field) => {
          /* ---------- special case: SoilMix ---------- */
          if (field.name === "soilMix") {
            const soilTypes = ["sand", "silt", "clay"] as const;

            return (
              <fieldset key="soilMix" className="mb-4">
                <legend className="block font-bold mb-1">
                  {t(field.labelKey)}
                </legend>

                {soilTypes.map((type) => (
                  <div key={type} className="mb-2 flex items-center gap-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {t(type)} {field.unit && `(${field.unit})`}
                    </label>
                    <input
                      id={`soilMix.${type}`}
                      type="number"
                      min={0}
                      max={100}
                      step={1}
                      {...register(`soilMix.${type}`, { valueAsNumber: true })}
                      className={cn(
                        "p-1 border rounded w-24",
                        errors.soilMix?.[type]
                          ? "border-red-500"
                          : "border-gray-300"
                      )}
                    />
                  </div>
                ))}

                {/* object-level error (“must add up to 100 %”) */}
                {errors.soilMix?.message && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.soilMix.message.toString()}
                  </p>
                )}
              </fieldset>
            );
          }

          /* ---------- default scalar fields ---------- */
          const isNumber = field.type === "number";
          const isDate = field.type === "date";

          return (
            <div key={field.name} className="mb-4">
              <label className="block font-bold text-gray-700">
                {t(field.labelKey)} {field.unit && `(${field.unit})`}
              </label>

              <input
                type={isDate ? "date" : isNumber ? "number" : "text"}
                /* let RHF handle coercion for numbers */
                {...register(field.name as any, isNumber ? { valueAsNumber: true } : {})}
                className={cn(
                  "w-full p-2 border rounded",
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                )}
              />

              {errors[field.name] && (
                <p className="text-xs text-red-400 mt-1">
                  {errors[field.name]?.message?.toString()}
                </p>
              )}
            </div>
          );
        })}
        {!isMaplocked &&
          <button
            type="submit"
            className="w-full bg-[#C5D4BC] hover:bg-[#a7b59f] text-white py-2 rounded mt-2"
          >
            {t("saveChanges")}
          </button>
        }
      </form>
    </div>
  );
});

PropMenu.displayName = "PropMenu";
export default PropMenu;