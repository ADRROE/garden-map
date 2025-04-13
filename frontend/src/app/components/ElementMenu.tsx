"use client";

import React, { useState } from "react";
import allElements from "../MenuElements.json";
import { MenuElement } from "../types";
import { useGarden } from "../context/GardenContext";
import { capitalizeFirstLetter } from "../utils";

const menuElements: MenuElement[] = allElements as MenuElement[];

const ElementMenu = () => {

  const { selectElement } = useGarden();
  // Get all unique categories from the menu elements
  const categories = [...new Set(menuElements.map(el => el.category))];
  // Set the first category as the default selected tab
  const [activeCategory, setActiveCategory] = useState(categories[0]);

  // Get all unique subcategories within the selected category
  const subCategories = [
    ...new Set(
      menuElements
        .filter(el => el.category === activeCategory) // only include elements from active category
        .map(el => el.subCategory)                    // extract subcategory names
    )
  ];
  // Set the first subcategory as default
  const [activeSubCategory, setActiveSubCategory] = useState(subCategories[0]);

  // Filter elements based on selected category and subcategory
  const filteredElements = menuElements.filter(
    (el) => el.category === activeCategory && el.subCategory === activeSubCategory
  );

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
    <div className="absolute right-4 top-4 w-64 bg-white shadow-lg p-4 rounded-xl border z-50">
            {/* Category Tabs (top row) */}
            <div className="flex border-b border-gray-300">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              // Reset subcategory tab when category changes
              const firstSub = menuElements.find(el => el.category === cat)?.subCategory;
              if (firstSub) setActiveSubCategory(firstSub);
            }}
            className={`flex-1 p-2 text-sm font-medium ${
              cat === activeCategory
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstLetter(cat)}
          </button>
        ))}
      </div>

      {/* Subcategory Tabs (second row) */}
      <div className="flex border-b border-gray-300">
        {subCategories.map((sub) => (
          <button
            key={sub}
            onClick={() => setActiveSubCategory(sub)}
            className={`flex-1 p-2 text-xs ${
              sub === activeSubCategory
                ? "bg-white border-b-2 border-blue-500 text-blue-600"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            {capitalizeFirstLetter(sub)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto flex-1">
        {filteredElements.map((element: MenuElement) => (
          <button
            key={element.id}
            className="p-2 bg-white shadow hover:shadow-md rounded-md flex items-center justify-center"
            draggable
            onClick={() => handleClick(element)}
          >
            <img src={element.icon} alt={element.name} className="w-6 h-6" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ElementMenu;
