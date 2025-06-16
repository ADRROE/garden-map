// /pages/api/items.ts
import fs from "fs";
import path from "path";
import { NextApiRequest, NextApiResponse } from "next";
import { GardenItem } from "../types"; // Adjust this path as needed

const dataFilePath = path.resolve("data", "items.json");

function readItems(): GardenItem[] {
  if (!fs.existsSync(dataFilePath)) return [];
  const content = fs.readFileSync(dataFilePath, "utf-8");
  return JSON.parse(content);
}

function saveItems(items: GardenItem[]) {
  fs.writeFileSync(dataFilePath, JSON.stringify(items, null, 2));
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  let items = readItems();

  switch (req.method) {
    case "GET":
      return res.status(200).json(items);

    case "POST":
      const newItem: GardenItem = req.body;
      items.push(newItem);
      saveItems(items);
      return res.status(201).json(newItem);

    case "PUT":
      const updated: GardenItem = req.body;
      items = items.map(el =>
        el.id === updated.id ? { ...el, ...updated } : el
      );
      saveItems(items);
      return res.status(200).json(updated);

    case "DELETE":
      const { id } = req.query;
      if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid ID" });
      }
      items = items.filter(el => el.id !== id);
      saveItems(items);
      return res.status(200).json({ success: true });

    default:
      res.setHeader("Allow", ["GET", "POST", "PUT", "DELETE"]);
      return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
