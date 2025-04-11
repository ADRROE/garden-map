"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { GardenElement, MenuElement, CreateElementFn, UpdateElementFn, GardenContextType } from "../types";
import { createElementAPI, updateElementAPI, deleteElementAPI } from "../services/elementsService";
import { translatePosition } from "../utils";
import { fetchElements } from "../services/elementsService";

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider = ({ children }: { children: React.ReactNode }) => {
  const [elements, setElements] = useState<GardenElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<MenuElement | null>(null);

  // Function to select an element (sets cursor image)
  const selectElement = (menuElement: MenuElement | null) => {
    setSelectedElement(menuElement);
  };

  // Function to place the element on the map
  const placeElement = (x: number, y: number) => {
    if (!selectedElement) return;

    const width = selectedElement.defaultWidth ?? 40;
    const height = selectedElement.defaultHeight ?? 40;

    createElement(selectedElement, x - width / 2, y - height / 2, width, height);
    setSelectedElement(null);
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    fetchElements().then((data) => {
        console.log("Fetched elements:", data); // 👈 helpful for debugging
        setElements(data);
    });
}, []);

  const createElement: CreateElementFn = async (menuElement, x, y, width, height) => {
    const newElement: GardenElement = {
      ...menuElement,
      id: crypto.randomUUID(),
      x,
      y,
      location: translatePosition(x, y),
      width,
      height,
    };
    setElements((prev) => [...prev, newElement]);
    try {
      await createElementAPI(newElement);
    } catch (error) {
      console.error("Failed to create element on server", error);
    }
  };

  const updateElement: UpdateElementFn = async (updatedElement) => {
    console.log("Updating element:", updatedElement);
    setElements((prev) =>
      prev.map((el) =>
        el.id === updatedElement.id ? { ...el, ...updatedElement } : el
      ));
    try {
      await updateElementAPI(updatedElement);
    } catch (error) {
      console.error("Failed to update element on server", error);
    }
  };

  const deleteElement = async (id: string) => {
    setElements(prev => prev.filter((el) => el.id !== id))
    try {
      await deleteElementAPI(id);
    } catch (error) {
      console.error("Failed to create element on server", error);
    }
  };

  return (
    <GardenContext.Provider value={{ elements, selectedElement, createElement, updateElement, selectElement, placeElement, deleteElement }}>
      {children}
    </GardenContext.Provider>
  );
};

export const useGarden = () => {
  const context = useContext(GardenContext);
  if (!context) {
    throw new Error("useGarden must be used within a GardenProvider");
  }
  return context;
};
