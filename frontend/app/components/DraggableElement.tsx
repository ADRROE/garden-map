import React, { useRef, useEffect } from "react";
import { Group, Image, Transformer, Text } from "react-konva";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { Image as KonvaImage } from "konva/lib/shapes/Image";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import useImage from "use-image";
import { DraggableElementProps } from "../types";
import { translatePosition, toColumnLetter, getCoveredCells } from "../utils/utils";
import { KonvaEventObject } from "konva/lib/Node";
import { useGarden } from "../context/GardenContext";

const DraggableElement: React.FC<DraggableElementProps> = ({ element, onUpdate, onSelect, isSelected, onDelete }) => {
    const [image] = useImage(element.icon);
    const groupRef = useRef<KonvaGroup>(null);
    const imageRef = useRef<KonvaImage>(null);
    const transformerRef = useRef<KonvaTransformer>(null);
    const {isMapLocked} = useGarden()

    useEffect(() => {
        if (!isSelected || !transformerRef.current || !groupRef.current) return;

        transformerRef.current.nodes([groupRef.current]);
        transformerRef.current.getLayer()?.batchDraw();
        
    }, [isSelected, element.width, element.height]);

    const handleTransformEnd = () => {
        const groupNode = groupRef.current;
        if (!groupNode || isMapLocked) return;

        const scaleX = groupNode.scaleX();
        const scaleY = groupNode.scaleY();
        
        const newWidth = (element.width ?? element.defaultWidth) * scaleX;
        const newHeight = (element.height ?? element.defaultHeight) * scaleY;
        const position = translatePosition(element.x, element.y);
        const coverage = getCoveredCells(position[0], position[1], element.width/19.5, element.height/19.5);
        
        // Reset scale
        groupNode.scale({ x: 1, y: 1 });

        // Now update the backend and state with the new dimensions.
        onUpdate({
            id: element.id,
            width: newWidth,
            height: newHeight,
            coverage: coverage
        });
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        if (isMapLocked) return
        const newX = e.target.x();
        const newY = e.target.y();
        const position = translatePosition(newX, newY);
        const coverage = getCoveredCells(position[0], position[1], element.width/19.5, element.height/19.5);

        onUpdate({
            id: element.id,
            x: newX,
            y: newY,
            location: `${toColumnLetter(position[0])}${position[1]}`,
            coverage: coverage,
        });
    };

    return (
        <>
            <Group
                ref={groupRef}
                x={element.x}
                y={element.y}
                draggable={!isMapLocked}
                onClick={onSelect}
                onDragEnd={handleDragEnd}
                onTransformEnd={handleTransformEnd}
            >
                <Image
                    ref={imageRef}
                    image={image}
                    width={element.width ?? 40}
                    height={element.height ?? 40}
                    alt="Draggable element"
                />
                {isSelected && (
                    <Text
                        text="✕"
                        fontSize={14}
                        fontStyle="bold"
                        fill="red"
                        onClick={(e) => {
                            e.cancelBubble = true; // prevent selecting the element itself
                            onDelete(element.id);
                        }}
                        listening={true}
                        width={20}
                        height={20}
                        x={(element.width ?? 40) - 10} // position in top-right of image
                        y={-5}
                    />
                )}
            </Group>
            {isSelected && (
                <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 20 || newBox.height < 20) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </>
    );
};

function areEqual(prevProps: DraggableElementProps, nextProps: DraggableElementProps) {
  return (
    prevProps.element.id === nextProps.element.id &&
    prevProps.element.x === nextProps.element.x &&
    prevProps.element.y === nextProps.element.y &&
    prevProps.element.width === nextProps.element.width &&
    prevProps.element.height === nextProps.element.height &&
    prevProps.isSelected === nextProps.isSelected
  );
}

export default React.memo(DraggableElement, areEqual);
