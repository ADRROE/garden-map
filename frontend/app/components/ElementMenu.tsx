"use client";

import React, { useState, useEffect } from "react";
import { MenuElement } from "../types";
import { capitalizeFirstLetter } from "../utils/utils";

import { menuItems } from '@/components/assets/menuItems';
import { useMenuStore } from "@/stores/useMenuStore";
import { useUIStore } from "@/stores/useUIStore";

const ElementMenu = () => {
  const selectElement  = useMenuStore(state => state.setSelectedItem)
  const isLoading = useMenuStore(state => state.isLoading)

  const categories = menuItems ? [...new Set(menuItems.map(el => el.category))] : [];
  const defaultCategory = categories[0] || "";
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  // Filter subcategories for the active category (skip undefined)
  const subCategories = menuItems ? [
    ...new Set(
      menuItems
        .filter(el => el.category === activeCategory && el.subCategory)
        .map(el => el.subCategory as string)
    )
  ] : [];

  const [activeSubCategory, setActiveSubCategory] = useState<string | null>(
    subCategories.length > 0 ? subCategories[0] : null
  );

  // When category changes, update subcategory
  useEffect(() => {
    const firstSub = menuItems?.find(el => el.category === activeCategory && el.subCategory)?.subCategory;
    setActiveSubCategory(firstSub || null);
  }, [activeCategory]);

  // Filter elements: match category, and match subcategory if available
  const filteredElements = menuItems?.filter((el) => {
    return (
      el.category === activeCategory &&
      (subCategories.length === 0 || el.subCategory === activeSubCategory)
    );
  });

  const handleClick = (element: MenuElement) => {
    return element
  };

  if (isLoading) {
    return (
      <div className="absolute h-screen overflow-y-auto right-4 top-4 w-64 bg-amber-50 shadow-lg p-4 border z-50">
        Loading menu...
      </div>
    );
  }

  return (
    <div className="absolute h-screen overflow-y-auto right-4 top-4 w-64 bg-amber-50 shadow-lg p-4 border z-50">
      {/* Category Tabs */}
      <div className="flex border-b border-gray-300">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{cursor: "pointer"}}
            className={`flex-1 p-2 text-sm font-medium ${cat === activeCategory
                ? "bg-white border-b-2 border-[#869D7A] text-[#869D7A]"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
          >
            {capitalizeFirstLetter(cat)}
          </button>
        ))}
      </div>

      {/* Subcategory Tabs - only if subcategories exist */}
      {subCategories.length > 0 && (
        <div className="flex border-b border-gray-300">
          {subCategories.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveSubCategory(sub)}
              style={{cursor: "pointer"}}
              className={`flex-1 p-2 text-xs ${sub === activeSubCategory
                  ? "bg-white border-b-2 border-[#869D7A] text-[#869D7A]"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
            >
              {capitalizeFirstLetter(sub)}
            </button>
          ))}
        </div>
      )}

      {/* Element Grid */}
      <div className="p-4 grid grid-cols-3 gap-4 overflow-y-auto flex-1">
        {filteredElements ? (
          filteredElements.map((element: MenuElement) => (
            <button
              key={element.id}
              className="p-2 bg-white shadow hover:shadow-md rounded-md flex items-center justify-center"
              draggable
              onClick={() => handleClick(element)}
              style={{cursor: "pointer"}}
            >
              <img src={element.icon} className="w-6 h-6" />
            </button>
          ))
        ) : (
          <div className="text-sm text-gray-500">No elements found.</div>
        )}
      </div>
    </div>
  );
};

export default ElementMenu;