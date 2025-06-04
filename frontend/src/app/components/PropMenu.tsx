"use client";
import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { ElementFormData } from "@/lib/elementSchema";
import { FieldConfigItem } from "@/lib/fieldConfig";

interface PropMenuProps {
  element: Partial<ElementFormData> & { id: string; name?: string } | null;
  onUpdate: (updated: ElementFormData & { id: string }) => void;
  onClose: () => void;
  fieldConfig: readonly FieldConfigItem[];
}

const PropMenu: React.FC<PropMenuProps> = ({ element, onUpdate, onClose, fieldConfig }) => {
  const t = useTranslations("PropMenu");
  const [formData, setFormData] = useState<Partial<ElementFormData>>({});

  useEffect(() => {
    if (element) {
      const initial: Partial<ElementFormData> = {};

      fieldConfig.forEach((field) => {
        const key = field.name as keyof ElementFormData;
        let value = (element as any)[key];

        if (field.type === "date" && value) {
          value = new Date(value).toISOString().split("T")[0];
        }

        // Safe assignment: key is known and value is correct type (string, number, etc.)
        initial[key] = value as any;
      });

      setFormData(initial);
    }
  }, [element, fieldConfig]);

  const handleChange = (name: keyof ElementFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!element) return;
    onUpdate({
      id: element.id,
      ...(formData as ElementFormData),
    });
    onClose();
  };

  if (!element) return null;

  const getInputValue = (key: keyof ElementFormData): string => {
    const raw = formData[key];
    if (raw instanceof Date) return raw.toISOString().split("T")[0];
    if (typeof raw === "number") return raw.toString();
    return raw ?? "";
  };

  return (
    <div className="absolute right-4 top-4 w-64 bg-white shadow-lg p-4 border z-50 rounded mb-1">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg text-black font-semibold">{element.name}</h2>
        <button onClick={onClose} className="text-gray-900 hover:text-black">✕</button>
      </div>

      {fieldConfig.map((field) => (
        <div key={field.name} className="mb-2">
          <label className="block text-sm text-black font-medium">
            {t(field.labelKey)} {field.unit && `(${field.unit})`}
          </label>
          <input
            type={field.type === "date" ? "date" : "text"}
            value={getInputValue(field.name)}
            className="w-full p-2 border rounded"
            onChange={(e) =>
              handleChange(field.name, field.type === "number"
                ? parseFloat(e.target.value)
                : e.target.value
              )
            }
          />
        </div>
      ))}

      <button
        className="w-full bg-[#C5D4BC] hover:bg-[#a7b59f] text-white py-2 rounded mt-2"
        onClick={handleSave}
      >
        {t("savechanges")}
      </button>
    </div>
  );
};

export default PropMenu;