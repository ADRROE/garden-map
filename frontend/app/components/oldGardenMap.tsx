"use client";

import React, { useRef, useState, useEffect } from "react";
import Konva from 'konva';
import { Stage, Layer, Rect, Image } from "react-konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { KonvaEventObject } from "konva/lib/Node";
import useImage from "use-image";
import DraggableElement from "./DraggableElement";
import Zone from "./Zone";
import PropMenu from "./PropMenu";
import { useGarden } from "../context/GardenContext";
import { GardenElement, MenuElement, ColoredCell, GardenZone } from "../types";
import { createZoneAPI, deleteZoneAPI, fetchZones } from "../services/apiService";
import NameModal from "./NameModal";
import allElements from "../MenuElements.json";


interface GardenMapProps {
    dimensions: { width: number; height: number };
}

const menuPalette: MenuElement[] = (allElements || []) as MenuElement[];

const GardenMap: React.FC<GardenMapProps> = ({ dimensions }) => {

    const stageRef = useRef<KonvaStage | null>(null);
    const mouseDownRef = useRef(false);

    const {
        elements,
        zones,
        showZones,
        coloredCells,
        selectedElement,
        pendingPosition,
        isMapLocked,
        setActiveColor,
        selectElement,
        colorCell,
        setColoredCells,
        setZones,
        setIsMapLocked,
        setSelectedElement,
        setPendingPosition,
        updateElement,
        placeElement,
        deleteElement,
        updateZone
    } = useGarden(); // ✅ Get elements from context

    const baseGridSize = 19.95;
    const bgWidth = 2500;
    const bgHeight = 2253;
    const stage = stageRef.current


    const handleDrag = (pos: { x: number, y: number }) => {
        if (!stage) return pos;

        const scale = stage?.scaleX() ?? 1;

        const maxX = 20;
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

        if (!stage) return;

        const scale = stage?.scaleX() ?? 1;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scaleBy = 1.05;

        let newScale = e.evt.deltaY > 0 ? scale / scaleBy : scale * scaleBy;

        const MIN_SCALE = 0.5;
        newScale = Math.max(newScale, MIN_SCALE);


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
    const [hoveredZoneId, setHoveredZoneId] = useState<string | null>(null);
    const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
    const [nameModalOpen, setNameModalOpen] = useState(false);
    const [isDraggingStage, setIsDraggingStage] = useState(true);
    const [isZonePainting, setIsZonePainting] = useState(false);
    const [modalMode, setModalMode] = useState<"element"|"zone" | null>(null);


    const zoneLayerRef = useRef<Konva.Layer | null>(null)
    const coloredCellsRef = useRef<Record<string, ColoredCell>>({});
    const freshCellsRef = useRef<Set<string>>(new Set());


    const [bgImage] = useImage("/grid.jpg");

    useEffect(() => {
        if (zoneLayerRef.current) {
            zoneLayerRef.current.batchDraw();
        }
    }, [zones, hoveredZoneId, coloredCells]);

    useEffect(() => {
        coloredCellsRef.current = coloredCells;
    }, [coloredCells]);


    const colorMap = {
        "loam": "#b88859",
        "sand": "#c7b199",
        "clay": "#dad6ba"
    };

    const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>, i?: number, j?: number) => {
        if (!stage) return;

        mouseDownRef.current = true;

        const clickedOnEmpty =
            e.target === stage || e.target.getParent()?.name() === "baselayer";

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const scale = stage.scaleX(); // assuming uniform
        const x = (pointer.x - stage.x()) / scale;
        const y = (pointer.y - stage.y()) / scale;

        if (selectedElement && clickedOnEmpty && !isMapLocked) {

            if (selectedElement.category !== "zone") {
                setPendingPosition({ x, y, subject: "element" });
                setModalMode("element");
                setNameModalOpen(true);

            }
            if (selectedElement.category === "zone") {

                setIsZonePainting(true);     
                document.body.style.cursor = "crosshair";

                setIsDraggingStage(false);

                if (typeof i === "number" && typeof j === "number") {
                    const color = colorMap[selectedElement!.iconName as keyof typeof colorMap];
                    colorCell(i, j, color, selectedElement.id);
                    freshCellsRef.current.add(`${i}-${j}`);
                    return;
                }
            }
        }
        if (clickedOnEmpty) {
            setSelectedNodeId(null);
            setSelectedZoneId(null);
            setPropMenu(null);
        }
    };

    const handleZoneEdit = (zone: { id: string } & Partial<GardenZone>) => {
        // 1) grab one of its cells to know which menu‐element drove it
        const firstCell = zone.coverage?.[0];
        if (!firstCell) return;

        // 2) look up the *palette* item (MenuElement) by that id
        const menuElement = menuPalette.find(m => m.id === firstCell.menuElementId);
        if (!menuElement) return;

        // 3) pretend the user just clicked that element in the palette
        selectElement(menuElement);
        setColoredCells({});         // start fresh
        setIsZonePainting(true);     // now we’re in paint-mode
        setIsDraggingStage(false);

        // 4) paint with exactly that element’s color
        setActiveColor({ color: colorMap[menuElement.iconName as keyof typeof colorMap] });

        // 6) now unlock & turn *on* paint mode
        setIsMapLocked(false);

        // 7) seed the grid with the existing coverage so you see it immediately
        const seeded: Record<string, ColoredCell> = {};
        zone.coverage?.forEach(c => {
            seeded[`${c.x}-${c.y}`] = c;
        });
        setColoredCells(seeded);
    };

    const handleStageMouseUp = () => {
        if (mouseDownRef.current && isZonePainting) {
            mouseDownRef.current = false;

            if (freshCellsRef.current.size > 0) {
                setModalMode("zone");
                setNameModalOpen(true);
              }              

            // reset
            freshCellsRef.current.clear();

            document.body.style.cursor = "default";
            setIsDraggingStage(true);
            setSelectedElement(null);
        }
    };

    useEffect(() => {
        document.body.style.cursor = isZonePainting ? "crosshair" : "default";

        return () => {
            document.body.style.cursor = "default";
        };
    }, [isZonePainting]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setActiveColor(null);
                setIsZonePainting(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown)
    });

    const [propMenu, setPropMenu] = useState<GardenElement | null>(null);
    const [propMenuPosition, setPropMenuPosition] = useState<{ x: number; y: number } | null>(null);

    const onDraggableElementSelect = () => {
        if (!stage) return;

        const pointer = stage.getPointerPosition();
        if (!pointer) return;

        const containerRect = stage.container().getBoundingClientRect();

        setPropMenuPosition({
            x: containerRect.left + pointer.x,
            y: containerRect.top + pointer.y,
        });
    };

    return (
        <div className="flex-1 relative">
            {dimensions.width > 0 && (
                <Stage
                    width={dimensions.width}
                    height={dimensions.height}
                    onWheel={handleWheel}
                    onMouseDown={(e) => handleStageMouseDown(e)}
                    onMouseUp={handleStageMouseUp}
                    onMouseLeave={() => {
                        setIsZonePainting(false);
                        setIsDraggingStage(true);

                    }}
                    onContextMenu={(e) => e.evt.preventDefault()} // disable right-click menu
                    draggable={isDraggingStage}
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
                                    listening={true}
                                    onMouseDown={(e) => handleStageMouseDown(e, i, j)}
                                    onMouseUp={handleStageMouseUp}
                                    onMouseEnter={() => {
                                        if (mouseDownRef.current && isZonePainting) {
                                            const color = colorMap[selectedElement!.iconName as keyof typeof colorMap];
                                            colorCell(i, j, color, selectedElement!.id);
                                            freshCellsRef.current.add(`${i}-${j}`);
                                        }
                                    }}
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
                                    onDraggableElementSelect();
                                }}
                                onDelete={(id: string) => {
                                    if (isMapLocked) return;
                                    deleteElement(id);
                                    setSelectedNodeId(null); // deselect after deletion
                                    setPropMenu(null);
                                    setIsMapLocked(true);
                                }}
                            />
                        ))}
                    </Layer>
                    {showZones && (
                        <Layer name="zonelayer" ref={zoneLayerRef}>
                            {Object.values(coloredCells).map((cell) => (
                                <Rect
                                    key={`${cell.x}-${cell.y}`}
                                    x={cell.x * baseGridSize}
                                    y={cell.y * baseGridSize}
                                    width={baseGridSize}
                                    height={baseGridSize}
                                    fill={cell.color}
                                />
                            ))}
                            {zones.map((zone) => (
                                <Zone
                                    key={zone.id}
                                    zone={zone}
                                    hoveredZoneId={hoveredZoneId}
                                    setHoveredZoneId={setHoveredZoneId}
                                    selectedZoneId={selectedZoneId}
                                    setSelectedZoneId={setSelectedZoneId}
                                    onClick={() => setSelectedZoneId(zone.id)}
                                    onUpdate={() => handleZoneEdit(zone)}
                                    onDelete={(id) => {
                                        // maybe add a confirm?
                                        deleteZoneAPI(id).then(() => {
                                            fetchZones().then(setZones);
                                            setColoredCells({})
                                        });
                                    }}
                                />
                            ))}
                        </Layer>
                    )}
                </Stage>
            )}
            {propMenu && propMenuPosition && (
                <div
                    style={{
                        position: 'absolute',
                        top: Math.min(propMenuPosition.y, window.innerHeight - 200), // clamp if too close to bottom
                        left: Math.min(propMenuPosition.x, window.innerWidth - 300), // clamp if too close to right
                        zIndex: 1000,
                    }}
                >
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
                </div>
            )}
            {nameModalOpen && (
            <NameModal
            onPlacement={async (inputName) => {
                try {
                  if (modalMode === "element" && pendingPosition?.subject === "element") {
                    await placeElement(pendingPosition.x!, pendingPosition.y!, inputName);
                  } else if (modalMode === "zone") {
                    const coverage = Object.values(coloredCells);
                    if (selectedZoneId) {
                      await updateZone({ id: selectedZoneId, name: inputName, coverage });
                    } else {
                      await createZoneAPI(coverage, inputName);
                      const fresh = await fetchZones();
                      setZones(fresh);
                    }
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  // CLEANUP
                  setNameModalOpen(false);
                  setModalMode(null);
                  setPendingPosition(null);
                  setSelectedZoneId(null);
                  setColoredCells({});
                  freshCellsRef.current.clear();
                  setIsZonePainting(false);
                }
              }}
            onAbort={() => { /* … */ }}
          />
          
            )}
        </div>
    );
};

export default GardenMap;
