"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { GardenElement, MenuElement, CreateElementFn, UpdateElementFn, GardenContextType } from "../types";
import { createElementAPI, updateElementAPI, deleteElementAPI } from "../services/elementsService";

const GardenContext = createContext<GardenContextType | undefined>(undefined);

export const GardenProvider = ({ children }: { children: React.ReactNode }) => {
  const [elements, setElements] = useState<GardenElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<MenuElement | null>(null);

  // Function to select an element (sets cursor image)
  const selectElement = (menuElement: MenuElement | null) => {
    setSelectedElement(menuElement);
  };

  // Function to place the element on the map
  const placeElement = (x: number, y: number, width: number, height: number) => {
    if (!selectedElement) return;

    createElement(selectedElement, x - 40 / 2, y - 40 / 2, 40, 40);
    setSelectedElement(null);
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    const fetchElements = async () => {
      const res = await fetch("/api/elements");
      const data: GardenElement[] = await res.json();
      setElements(data);
    };
    fetchElements();
  }, [])

  const createElement: CreateElementFn = async (menuElement, x, y, width, height) => {
    const newElement: GardenElement = {
      ...menuElement,
      id: crypto.randomUUID(),
      x,
      y,
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
