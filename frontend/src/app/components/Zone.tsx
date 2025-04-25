"use client"
import React from "react";
import { Group, Rect, Line, Text, Circle } from "react-konva";
import { ZoneProps } from "../types";
import { useGarden } from "../context/GardenContext";
import { darkenColor } from "../utils";

const Zone: React.FC<ZoneProps> = ({ zone, hoveredZoneId, selectedZoneId, onClickZone, onDeleteZone, setHoveredZoneId }) => {
    const { isMapLocked } = useGarden()

    const baseGridSize = 19.95

    const cellXs = zone.coverage.map((c) => c.x);
    const cellYs = zone.coverage.map((c) => c.y);
    const maxX = Math.max(...cellXs);
    const minY = Math.min(...cellYs);

    return (
        <>
            {zone.coverage.map(({ x, y, color }) => (
                <Group
                    key={`zone-${zone.id}-${x}-${y}`}
                    onMouseEnter={() => {
                        if (!isMapLocked) setHoveredZoneId(zone.id);
                    }}
                    onMouseLeave={() => {
                        if (!isMapLocked) setHoveredZoneId(null);
                    }}>
                    <Rect
                        x={x * baseGridSize}
                        y={y * baseGridSize}
                        width={baseGridSize}
                        height={baseGridSize}
                        fill={color}
                        stroke="transparent"
                        listening={true}
                        onClick={() => onClickZone?.()}
                    />
                </Group>
            ))}
            {zone.borders.map(([[x1, y1], [x2, y2]], idx) => (
                <Line
                    key={`zone-border-${zone.id}-${idx}`}
                    points={[
                        x1 * baseGridSize,
                        y1 * baseGridSize,
                        x2 * baseGridSize,
                        y2 * baseGridSize,
                    ]}
                    stroke={(hoveredZoneId || selectedZoneId === zone.id) && !isMapLocked ? darkenColor(zone.color, 20) : 'transparent'}
                    strokeWidth={3}
                />
            ))}
            {(hoveredZoneId === zone.id || selectedZoneId === zone.id) && !isMapLocked && (
                <>
                    <Circle
                        x={maxX * baseGridSize + baseGridSize}
                        y={minY * baseGridSize}
                        radius={8}
                        fill="red"
                        stroke="red"
                        strokeWidth={1}
                        onClick={(e) => {
                            e.cancelBubble = true;
                            onDeleteZone?.(zone.id);
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
                            onDeleteZone?.(zone.id);
                        }}
                        align="center"
                        verticalAlign="middle"
                        listening={true}
                    />
                </>
            )}
        </>
    )
}

export default React.memo(Zone);