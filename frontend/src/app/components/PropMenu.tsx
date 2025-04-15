"use client"
import React, {useState} from "react"
import { GardenElement, UpdateElementFn } from "../types"

interface ElementProps {
    element: GardenElement,
    onUpdate: (UpdateElementFn),
    onClose: () => void,
};

const PropMenu: React.FC<ElementProps> = ({element, onUpdate, onClose}) => {
    const [datePlanted, setDatePlanted] = useState(element.datePlanted ? new Date(element.datePlanted).toISOString().split("T")[0] : "");
    const [price, setPrice] = useState(element.price?.toString() ?? "");
    const [rhsId, setRhsId] = useState(element.rhsId ?? "");
    const [wcvpId, setWcvpId] = useState(element.wcvpId ?? "");

    const handleSave = () => {
        onUpdate({
            id: element.id,
            datePlanted: element.datePlanted ? new Date(datePlanted) : undefined,
            price: price ? parseFloat(price) : undefined,
            rhsId: rhsId || undefined,
            wcvpId: wcvpId || undefined,
        });
        onClose();
    }
    return (
        <div className="absolute right-4 top-4 w-64 bg-white shadow-lg p-4 rounded-xl border z-50">
          <div className="flex justify-between mb-4">
            <h2 className="text-lg text-black font-semibold">{element.name}</h2>
            <button onClick={onClose} className="text-gray-900 hover:text-black">✕</button>
          </div>
    
          <label className="block text-sm text-black font-medium">Date Planted</label>
          <input
            type="date"
            className="w-full p-2 border rounded mb-2"
            value={datePlanted}
            onChange={(e) => setDatePlanted(e.target.value)}
          />
    
          <label className="block text-sm text-black font-medium">Price (€)</label>
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
    
          <button
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
            onClick={handleSave}
          >
            Save Changes
          </button>
        </div>
      );
    };
    
    export default PropMenu;

