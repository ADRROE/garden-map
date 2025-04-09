// /pages/api/elements.ts
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { GardenElement } from "@/app/types"; // Adjust this path as needed

const dataFilePath = path.resolve("data", "elements.json");

function readElements(): GardenElement[] {
  if (!fs.existsSync(dataFilePath)) return [];
  const content = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(content);
}

function saveElements(elements: GardenElement[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(elements, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let elements = readElements();

  switch (req.method) {
    case "GET":
      return res.status(200).json(elements);

    case "POST":
      const newElement: GardenElement = req.body;
      elements.push(newElement);
      saveElements(elements);
      return res.status(201).json(newElement);

    case "PUT":
      const updated: GardenElement = req.body;
      elements = elements.map(el =>
        el.id === updated.id ? { ...el, ...updated } : el
      );
      saveElements(elements);
      return res.status(200).json(updated);

    case "DELETE":
      const { id } = req.query;
      if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid ID" });
      }
      elements = elements.filter(el => el.id !== id);
      saveElements(elements);
      return res.status(200).json({ success: true });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
