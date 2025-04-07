"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { GardenElement, MenuElement, CreateElementFn, UpdateElementFn, GardenContextType } from "../types";

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
  
    createElement(selectedElement, x - (selectedElement.width ?? 40) / 2, y - (selectedElement.height ?? 40) / 2);
    setSelectedElement(null);
    document.body.style.cursor = "default";
  };

  useEffect(() => {
    const fetchElements = async() => {
        const res = await fetch("/api/elements");
        const data: GardenElement[] = await res.json();
        console.log(data);
        setElements(data);
    };
    fetchElements();
  }, [])

  const createElement: CreateElementFn = async(menuElement, x, y) => {
    const newElement: GardenElement = { 
        ...menuElement,
        id: crypto.randomUUID(),
        x,
        y
     };
     await fetch("/api/elements", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(newElement)
     });
    setElements((prev) => [...prev, newElement]);
  };

  const updateElement: UpdateElementFn = async(updatedElement) => {
    await fetch ("/api/elements", {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(updatedElement)
    });
    setElements((prev) =>
    prev.map((el) =>
    el.id === updatedElement.id ? { ...el, ...updatedElement } : el
    ));
  };

  const deleteElement = async(id: string) => {
    await fetch (`/api/elements?id=${id}`, {
        method: "DELETE"
    });
    setElements(prev => prev.filter((el) => el.id !== id) )
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
