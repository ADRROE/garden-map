"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ItemFormData } from "@/lib/itemSchema";
import { FieldConfigItem } from "@/lib/fieldConfig";
import { ZoneFormData } from "@/lib/zoneSchema";

interface PropMenuProps {
  data: (Partial<ItemFormData> | Partial<ZoneFormData>) & { id: string; name?: string; };
  onUpdate: (updated: ItemFormData | ZoneFormData & { id: string }) => void;
  onClose: () => void;
  fieldConfig: readonly FieldConfigItem[];
}

const PropMenu: React.FC<PropMenuProps> = ({ data, onUpdate, onClose, fieldConfig }) => {
  const t = useTranslations("PropMenu");
  const [formData, setFormData] = useState<Partial<ItemFormData & ZoneFormData>>({});
  const applicableFields = fieldConfig.filter(field => field.name in data);
  const readOnlyFields = applicableFields.filter(f => f.readOnly);
  const editableFields = applicableFields.filter(f => !f.readOnly);

  useEffect(() => {
    const initial: Record<string, unknown> = {};
    applicableFields.forEach(({ name, type }) => {
      let value = data[name as keyof typeof data];
      if (type === "date" && value) {
        value = new Date(value).toISOString().split("T")[0];
      }
      if (value !== undefined) {
        initial[name] = value;
      }
    });
    setFormData(initial as Partial<ItemFormData & ZoneFormData>);
  }, [data, fieldConfig]);

  const handleChange = (name: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    onUpdate({
      id: data.id,
      ...(formData as ItemFormData | ZoneFormData),
    });
    onClose();
  };

  const getInputValue = (key: string): string => {
    const raw = formData[key as keyof typeof formData];
    if (raw instanceof Date) return raw.toISOString().split("T")[0];
    if (typeof raw === "number") return raw.toFixed(2);
    return raw ?? "";
  };

  return (
    <div className="absolute right-4 top-4 w-64 bg-white shadow-lg p-4 border z-50 rounded mb-1 max-h-[80vh] overflow-y-auto">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg text-black font-semibold">{data.name}</h2>
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
      {editableFields.map((field) => (
        <div key={field.name} className="mb-2">
          <label className="block text-sm text-black font-medium">
            {t(field.labelKey)} {field.unit && `(${field.unit})`}
          </label>
          <input
            type={field.type === "date" ? "date" : "text"}
            value={getInputValue(field.name)}
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
      ))}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <button
          className="w-full bg-[#C5D4BC] hover:bg-[#a7b59f] text-white py-2 rounded mt-2"
          type="submit"
          onClick={handleSave}
        >
          {t("saveChanges")}
        </button>
      </form>
    </div>
  );
};

export default PropMenu;