"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm } from 'react-hook-form';
import { zodResolver } from "@hookform/resolvers/zod";
import { ItemFormData } from "@/lib/itemSchema";
import { FieldConfigItem } from "@/lib/fieldConfig";
import { isSoilMix, ZoneFormData, zoneSchema } from "@/lib/zoneSchema";
import { itemSchema } from "@/lib/itemSchema";
import { cn } from "@/utils/utils";
import { FieldError, UseFormRegister } from "react-hook-form";

interface PropMenuProps {
  fields: FieldConfigItem[];
  formData: (Partial<ItemFormData> & Partial<ZoneFormData>) & { id: string; name?: string; };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  register?: UseFormRegister<FieldConfigItem>;
  error?: FieldError;
  onUpdate: (updated: ItemFormData | ZoneFormData & { id: string }) => void;
  onClose: () => void;
}

const PropMenu: React.FC<PropMenuProps> = ({ 
  fields,
  formData,
  setFormData,
  register,
  onUpdate, 
  onClose, 
 }) => {
  const combinedSchema = zoneSchema.merge(itemSchema);
  const t = useTranslations('PropMenu');
  // const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(combinedSchema), mode: 'onChange' })

  const applicableFields = fields.filter(field => field.name in formData);
  const readOnlyFields = applicableFields.filter(f => f.readOnly);
  const editableFields = applicableFields.filter(f => !f.readOnly);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev: typeof formData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onUpdate({
      id: formData.id,
      ...(formData as ItemFormData & ZoneFormData),
    });
    onClose();
  };

  const getInputValue = (key: string): string => {
    const raw = formData[key as keyof typeof formData];
    if (raw instanceof Date) return raw.toISOString().split("T")[0];
    if (typeof raw === "number") return raw.toFixed(2);
    if (isSoilMix(raw)) {
      // Convert SoilMix to a compact string like "sand:25,loam:25,..."
      return Object.entries(raw)
        .map(([type, value]) => `${type}:${value}`)
        .join(", ");
    }
    return raw ?? "";
  };

  return (
    <div className="absolute right-4 top-4 w-64 bg-white shadow-lg p-4 border z-50 rounded mb-1 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between mb-4">
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
      {editableFields.map((field) => {
        const isDate = field.type === "date";
        const value = getInputValue(field.name);
        const hasValue = Boolean(value);

        if (field.name === "soilMix") {
          const soilTypes = ["sand", "loam", "clay", "compost"] as const;
          const soilMix = formData.soilMix;

          const isValid = soilMix && typeof soilMix === "object" && !Array.isArray(soilMix);

          const mix = isValid
            ? soilMix
            : { sand: 0, loam: 0, clay: 0, compost: 0 };
          return (
            <div key={field.name}>
              <label className="block font-bold mb-1">Soil Mix</label>

              {soilTypes.map((type) => (
                <div key={type} className="mb-2">
                  <label className="mr-2 capitalize">{type}</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    value={mix[type] ?? 0}
                    onChange={(e) => {
                      const updated = {
                        ...mix,
                        [type]: Number(e.target.value),
                      };
                      setFormData({
                        ...formData,
                        soilMix: updated,
                      });
                    }}
                    className="p-1 border rounded w-24"
                  />
                </div>
              ))}
            </div>
          );
        }

        return (
          <div key={field.name} className="mb-2">
            <label className="block text-sm text-black font-medium">
              {t(field.labelKey)} {field.unit && `(${field.unit})`}
            </label>
            <input
              type={isDate && !hasValue ? "text" : field.type}
              inputMode={isDate && !hasValue ? "none" : undefined}
              placeholder={isDate ? "dd-mm-yyyy" : undefined}
              value={value}
              className="w-full p-2 border rounded"
              onChange={(e) =>
                handleChange(
                  field.name,
                  field.type === "number"
                    ? parseFloat(e.target.value)
                    : e.target.value
                )
              }
            />
          </div>
        );
      })}

      <form
        // onSubmit={handleSubmit((data) => console.log(data))}
      >
        {/* {editableFields.map((field) => {
          const value = getInputValue(field.name);
          return (
            <div key={field.name}>
              <div>
                <label className="block">{t(field.labelKey)} {field.unit && `(${field.unit})`}</label>
              </div>
              <input
                {...register(field.name)}
                className={cn(
                  "w-full p-2 border rounded",
                  errors[field.name] ? "border-red-500" : "border-gray-300"
                )}
              />
              <p className="text-xs text-red-400 mt-1">
                {errors[field.name]?.message?.toString()}
              </p>

            </div>)
        })} */}
        <button
          className="w-full bg-[#C5D4BC] hover:bg-[#a7b59f] text-white py-2 rounded mt-2"
          type="submit"
        >
          {t("saveChanges")}
        </button>
      </form>
    </div>
  );
};

export default PropMenu;