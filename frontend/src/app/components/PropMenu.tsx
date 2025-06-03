"use client"
import React, { useState } from "react"
import { GardenElement, UpdateElementFn } from "../types"
import { useTranslations } from "next-intl";

interface ElementProps {
  element: GardenElement | null,
  onUpdate: (UpdateElementFn),
  onClose: () => void,
};

const PropMenu: React.FC<ElementProps> = ({ element, onUpdate, onClose }) => {
  const [datePlanted, setDatePlanted] = useState(element?.datePlanted ? new Date(element?.datePlanted).toISOString().split("T")[0] : "");
  const [price, setPrice] = useState(element?.price?.toString() ?? "");
  const [rhsId, setRhsId] = useState(element?.rhsId ?? "");
  const [wcvpId, setWcvpId] = useState(element?.wcvpId ?? "");

  const t = useTranslations('PropMenu');

const datePlantedDefault = element?.datePlanted ? new Date(element?.datePlanted).toISOString().split("T")[0] : "";

const hasChanged =
  datePlantedDefault !== datePlanted ||
  (element?.price?.toString() ?? "") !== price ||
  (element?.rhsId ?? "") !== rhsId ||
  (element?.wcvpId ?? "") !== wcvpId;

  const handleSave = () => {
    if (!element) return;
    onUpdate({
      id: element?.id,
      datePlanted: element?.datePlanted ? new Date(datePlanted) : undefined,
      price: price ? parseFloat(price) : undefined,
      rhsId: rhsId || undefined,
      wcvpId: wcvpId || undefined,
    });
    onClose();
  }
  return (
    <div className="absolute right-4 top-4 w-64 bg-white shadow-lg p-4 border z-50 rounded mb-1">
      <div className="flex justify-between mb-4">
        <h2 className="text-lg text-black font-semibold">{element?.name}</h2>
        <button onClick={onClose} className="text-gray-900 hover:text-black">✕</button>
      </div>

      <label className="block text-sm text-black font-medium">{t('dateplanted')}</label>
      <input
        type="date"
        className="w-full p-2 border rounded mb-2"
        value={datePlanted}
        onChange={(e) => setDatePlanted(e.target.value)}
      />

      <label className="block text-sm text-black font-medium">{t('priceEUR')}</label>
      <input
        type="number"
        className="w-full p-2 border rounded mb-2"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <label className="block text-sm text-black font-medium">WCVP ID</label>
      <input
        className="w-full p-2 border rounded mb-2"
        value={wcvpId}
        onChange={(e) => setWcvpId(e.target.value)}
      />

      <label className="block text-sm text-black font-medium">RHS ID</label>
      <input
        className="w-full p-2 border rounded mb-4"
        value={rhsId}
        onChange={(e) => setRhsId(e.target.value)}
      />
      {hasChanged &&
        <button
          className="w-full bg-[#C5D4BC] hover:bg-[#a7b59f] text-white py-2 rounded mb-1"
          onClick={handleSave}
        >
          {t('savechanges')}
        </button>
      }
    </div>
  );
};

export default PropMenu;

