"use client"
import React from "react";
import { Group, Rect, Line, Text, Circle, Image } from "react-konva";
import { ZoneProps } from "../types";
import { useGarden } from "../context/GardenContext";
import { darkenColor } from "../utils/utils";
import useImage from "use-image";

const Zone: React.FC<ZoneProps> = ({ zone, hoveredZoneId, selectedZoneId, onClick, onUpdate, onDelete, setHoveredZoneId }) => {
    const { isMapLocked, selectedElement } = useGarden()

    const baseGridSize = 19.95
    const fontSize = 50

    const cellXs = zone.coverage.map((c) => c.x);
    const cellYs = zone.coverage.map((c) => c.y);
    const maxX = Math.max(...cellXs);
    const maxY = Math.max(...cellYs);
    const minX = Math.min(...cellXs);
    const minY = Math.min(...cellYs);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const [pencilImage] = useImage("/pencil.png")

    const isEditingThisZone = selectedElement?.category === "zone" && selectedElement?.id === zone.coverage[0].menuElementId;

    return (
        <>

            <Group
                key={zone.id}
                onMouseEnter={() => !isMapLocked && setHoveredZoneId(zone.id)}
                onMouseLeave={() => !isMapLocked && setHoveredZoneId(null)}
                onClick={() => onClick?.()}
            >
                {!isEditingThisZone && zone.coverage.map((cell) => (
                    <Rect
                        key={`zone-cell-${cell.x}-${cell.y}`}
                        x={cell.x * baseGridSize}
                        y={cell.y * baseGridSize}
                        width={baseGridSize}
                        height={baseGridSize}
                        fill={zone.color}
                        stroke="transparent"
                    />
                ))}
                {zone.name &&
                    <Group>
                        <Text
                            text={zone.name}
                            fontSize={fontSize}
                            x={centerX * baseGridSize}
                            y={centerY * baseGridSize}
                            offsetX={(zone.name.length * fontSize) / 6} // rough centering based on text length
                            offsetY={fontSize / 3}
                            align="center"
                            verticalAlign="middle"
                            fill={darkenColor(zone.color, 50)}
                        />
                    </Group>
                }
            </Group>

            {zone.borders.map(([[x1, y1], [x2, y2]], idx) => (
                <Line
                    key={`zone-border-${zone.id}-${idx}`}
                    points={[
                        x1 * baseGridSize,
                        y1 * baseGridSize,
                        x2 * baseGridSize,
                        y2 * baseGridSize,
                    ]}
                    stroke={(hoveredZoneId === zone.id || selectedZoneId === zone.id) && !isMapLocked ? darkenColor(zone.color, 20) : 'transparent'}
                    strokeWidth={3}
                />
            ))}
            {(hoveredZoneId === zone.id || selectedZoneId === zone.id) && !isMapLocked && (
                <Group>
                    <Circle
                        x={maxX * baseGridSize + baseGridSize}
                        y={minY * baseGridSize}
                        radius={8}
                        fill="red"
                        stroke="red"
                        strokeWidth={1}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            onDelete?.(zone.id);
                        }}
                        shadowColor="black"
                        shadowBlur={4}
                        shadowOffset={{ x: 1, y: 1 }}
                        shadowOpacity={0.2}
                    />
                    <Text
                        text="×"
                        fontSize={12}
                        fontStyle="bold"
                        fill="white"
                        x={maxX * baseGridSize + baseGridSize - 4}
                        y={minY * baseGridSize - 4}
                        width={8}
                        height={8}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            onDelete?.(zone.id);
                        }}
                        align="center"
                        verticalAlign="middle"
                        listening={true}
                    />
                    <Image
                        image={pencilImage}
                        width={15}
                        height={15}
                        x={maxX * baseGridSize + baseGridSize - 25}
                        y={minY * baseGridSize - 8}
                        onClick={() => {
                            onUpdate(zone)
                        }
                        }
                        alt="pencil"
                    />
                </Group>
            )}
        </>
    )
}

export default React.memo(Zone);