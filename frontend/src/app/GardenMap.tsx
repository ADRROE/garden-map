"use client";

import React, { useRef, useState, useEffect } from "react";
import Konva from 'konva';
import { Stage, Layer, Rect, Image } from "react-konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import { KonvaEventObject } from "konva/lib/Node";
import useImage from "use-image";
import DraggableElement from "./components/DraggableElement";
import Zone from "./components/Zone";
import PropMenu from "./components/PropMenu";
import { useGarden } from "./context/GardenContext";
import { GardenElement } from "./types";
import { createZoneAPI, deleteZoneAPI, fetchZones } from "./services/elementsService";
import NameModal from "./components/NameModal";

interface GardenMapProps {
    dimensions: { width: number; height: number };
}

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
        activeColor,
        setActiveColor,
        isPainting,
        setIsPainting,
        isErasing,
        setIsErasing,
        colorCell,
        setColoredCells,
        setZones,
        setIsMapLocked,
        setSelectedElement,
        setPendingPosition,
        updateElement,
        placeElement,
        deleteElement
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
    const [isDraggingStage, setIsDraggingStage] = useState(true);
    const zoneLayerRef = useRef<Konva.Layer | null>(null)

    useEffect(() => {
        if (zoneLayerRef.current) {
            zoneLayerRef.current.batchDraw();
        }
    }, [zones, hoveredZoneId]);

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
                setPendingPosition({ x, y });
                setNameModalOpen(true);
            }
            if (selectedElement.category === "zone") {
                const color = colorMap[selectedElement.iconName as keyof typeof colorMap];
                setActiveColor({ color });

                const isRightClick = e.evt.button === 2 || e.evt.ctrlKey;
                setIsPainting(!isRightClick);
                setIsErasing(isRightClick);
                setIsDraggingStage(false);

                if (typeof i === "number" && typeof j === "number") {
                    if (isPainting) {
                        colorCell(i, j, activeColor?.color ?? "", selectedElement?.id ?? "");
                    } else if (isErasing) {
                        colorCell(i, j, "", "");
                    }
                }

            }
        }
        if (clickedOnEmpty) {
            setSelectedNodeId(null);
            setSelectedZoneId(null);
            setPropMenu(null);
            document.body.style.cursor = "default";
        }
    };

    const handleStageMouseUp = () => {
        mouseDownRef.current = false
        if (isPainting) {
            createZoneAPI(Object.values(coloredCells)).then(() => {
                setIsPainting(false);
                setIsErasing(false);
                fetchZones().then((freshZones) => {
                    setZones(freshZones);
                });
            })
        }
        setSelectedElement(null);
        setIsDraggingStage(true);
    };

    useEffect(() => {
        document.body.style.cursor = isPainting ? "crosshair" : "default";

        return () => {
            document.body.style.cursor = "default";
        };
    }, [isPainting]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                event.preventDefault();
                setActiveColor(null);
                setIsPainting(false);
                setIsErasing(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, []);

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

    const [nameModalOpen, setNameModalOpen] = useState(false);
    const [inputName, setInputName] = useState("");

    const [bgImage] = useImage("/grid.jpg");

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
                        setIsPainting(false);
                        setIsErasing(false);
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
                                    onMouseDown={(e) => handleStageMouseDown(e)}
                                    onMouseEnter={() => {
                                        if (mouseDownRef.current && isPainting) {
                                            colorCell(i, j, activeColor?.color ?? "", selectedElement?.id ?? "");
                                        } else if (mouseDownRef.current && isErasing) {
                                            colorCell(i, j, "", "");
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
                                    onClick={() => setSelectedZoneId(`${cell.x}-${cell.y}`)}
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
                                    onClickZone={() => setSelectedZoneId(zone.id)}
                                    onDeleteZone={(id) => {
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
            {nameModalOpen && pendingPosition && (
                <NameModal
                    inputName={inputName}
                    setInputName={setInputName}
                    onPlacement={() => {
                        placeElement(pendingPosition.x, pendingPosition.y, inputName)
                        setNameModalOpen(false)}}
                    onAbort={() => {
                        setNameModalOpen(false);
                        setSelectedElement(null);
                        }
                    }
                />
            )}
        </div>
    );
};

export default GardenMap;
