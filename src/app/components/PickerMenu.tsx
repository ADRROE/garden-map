"use client";

import React from "react";
import allElements from "../MenuElements.json";
import { MenuElement } from "../types";
import { useGarden } from "../context/GardenContext";

const menuElements: MenuElement[] = allElements as MenuElement[];

const ElementPicker = () => {

    const { selectElement } = useGarden();

    const handleClick = (element: MenuElement) => {
        selectElement(element)
        const cursorImage = element.cursor || element.icon;
        const image = new Image();
        image.src = cursorImage;
    
        image.onload = () => {
            // Only set the cursor once image is loaded
            document.body.style.cursor = `url(${cursorImage}) 16 16, auto`;
        };
    
        image.onerror = () => {
            console.warn("Cursor image failed to load:", cursorImage);
            document.body.style.cursor = "crosshair"; // fallback
        };
    }

    return (
        <aside className="w-80 bg-gray-200 p-6 grid grid-cols-3 gap-4">
            {menuElements.map((element) => (
                <button
                    key={element.id}
                    className="p-2 bg-white shadow cursor-pointer rounded-md flex items-center justify-center"
                    draggable
                    onClick={() => handleClick(element)} // ✅ Change cursor
                >
                    <img src={element.icon} alt={element.name} className="w-6 h-6" />

                </button>
            ))}
        </aside>
    );
};

export default ElementPicker;
