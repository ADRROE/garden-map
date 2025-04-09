"use client";

import React, { useRef, useState } from "react";
import { Stage, Layer, Rect, Image } from "react-konva";
import type { Stage as KonvaStage } from "konva/lib/Stage"; // ✅ Import Konva's Stage type
import { KonvaEventObject } from "konva/lib/Node";
import useImage from "use-image";
import DraggableElement from "./components/DraggableElement";
import PropMenu from "./components/PropMenu";
import { useGarden } from "./context/GardenContext";
import { GardenElement } from "./types";

interface GardenMapProps {
    dimensions: { width: number; height: number };
}

const GardenMap: React.FC<GardenMapProps> = ({ dimensions }) => {

    const stageRef = useRef<KonvaStage | null>(null);
    const { elements, selectedElement, updateElement, placeElement, deleteElement } = useGarden(); // ✅ Get elements from context

    const baseGridSize = 19.95;
    const bgWidth = 2500;
    const bgHeight = 2253;

    const handleDrag= (pos) => {
        const stage = stageRef.current;
        if (!stage) return pos;

        const scale = stage?.scaleX() ?? 1;
        
        const maxX = 0;
        const maxY = 0;
        
        const scaledWidth = bgWidth * scale;
        const scaledHeight = bgHeight * scale;

        const minX = Math.min(dimensions.width - scaledWidth, 0);
        const minY = Math.min(dimensions.height - scaledHeight, 0);

        return {
            x: Math.max(Math.min(maxX, pos.x), minX),
            y: Math.max(Math.min(maxY, pos.y), minY)
        }
    }

    const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        if (!stage) return;

        const scale = stage?.scaleX() ?? 1;
        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scaleBy = 1.05;
        const newScale = e.evt.deltaY > 0 ? scale / scaleBy : scale * scaleBy;

        // Calculate the difference in position before and after scaling
        const mousePointTo = {
            x: (pointer.x - stage.x()) / scale,
            y: (pointer.y - stage.y()) / scale,
        };

        stage.scale({ x: newScale, y: newScale });

        const newPos = {
            x: pointer.x - mousePointTo.x * newScale,
            y: pointer.y - mousePointTo.y * newScale,
        };

        stage.position(newPos);
        stage.batchDraw();
    };

    const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

    const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
        const stage = e.target.getStage();
        if (!stage) return;

        const clickedOnEmpty =
            e.target === stage || e.target.getParent()?.name() === "baselayer";

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scale = stage.scaleX(); // assuming uniform
        const x = (pointer.x - stage.x()) / scale;
        const y = (pointer.y - stage.y()) / scale;

        if (selectedElement && clickedOnEmpty) {
            placeElement(x, y);
            document.body.style.cursor = "default";
            return;
        }

        if (clickedOnEmpty) {
            setSelectedNodeId(null);
            setPropMenu(null);
            document.body.style.cursor = "default";
        }
    };

    const [propMenu, setPropMenu] = useState<GardenElement | null>(null);


    const [bgImage] = useImage("/grid.jpg")

    return (
        <div className="flex-1 relative">
            {dimensions.width > 0 && (
                <Stage
                    width={dimensions.width}
                    height={dimensions.height}
                    onWheel={handleWheel}
                    onMouseDown={handleStageMouseDown}
                    draggable
                    dragBoundFunc={(pos) => handleDrag(pos)}
                    className="border border-gray-300"
                    ref={stageRef}
                >
                    <Layer name="baselayer">
                        {bgImage && <Image image={bgImage} x={-76} y={-78.5} width={bgWidth} height={bgHeight} alt="background" />}
                        {[...Array(117)].map((_, i) => (
                            [...Array(105)].map((_, j) => (
                                <Rect
                                    key={`${i}-${j}`}
                                    x={i * baseGridSize}
                                    y={j * baseGridSize}
                                    width={baseGridSize}
                                    height={baseGridSize}
                                    stroke="gray"
                                    strokeWidth={0.5}
                                    listening={true} // important: allow events

                                />
                            ))
                        ))}
                        {/* Render Elements from Context */}
                        {elements.map((element) => (
                            <DraggableElement
                                key={element.id}
                                element={element}
                                onUpdate={updateElement}
                                isSelected={selectedNodeId === element.id}
                                onSelect={() => {
                                    setSelectedNodeId(element.id);
                                    setPropMenu(element);
                                }}
                                onDelete={(id: string) => {
                                    deleteElement(id);
                                    setSelectedNodeId(null); // deselect after deletion
                                }}
                            />
                        ))}
                    </Layer>
                </Stage>
            )}
                                {propMenu && (
                        <PropMenu
                            element={propMenu}
                            onUpdate={(updatedData) => {
                                updateElement(updatedData);
                                // also update local state if needed
                                setPropMenu((prev) =>
                                    prev && prev.id === updatedData.id
                                        ? { ...prev, ...updatedData }
                                        : prev
                                );
                            }}
                            onClose={() => setPropMenu(null)}
                        />
                    )}
        </div>
    );
};

export default GardenMap;
