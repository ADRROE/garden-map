import React, { useRef, useEffect } from "react";
import { Group, Image, Transformer, Text } from "react-konva";
import useImage from "use-image";
import { DraggableElementProps } from "../types";
import { translatePosition } from "../utils";
import { KonvaEventObject } from "konva/lib/Node";

const DraggableElement: React.FC<DraggableElementProps> = ({ element, onUpdate, onSelect, isSelected, onDelete }) => {
    const [image] = useImage(element.icon);
    const groupRef = useRef<any>(null);
    const imageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && transformerRef.current && groupRef.current) {
            transformerRef.current.nodes([groupRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleTransformEnd = () => {
        const groupNode = groupRef.current;
        if (!groupNode) return;

        // Get the client rectangle, which reflects the visual (transformed) size
        const newBox = groupNode.getClientRect({ skipTransform: false });
        const newWidth = newBox.width;
        const newHeight = newBox.height;

        // Reset the group's scale to 1 (this "commits" the transformation)
        groupNode.scaleX(1);
        groupNode.scaleY(1);

        // Now update the backend and state with the new dimensions.
        onUpdate({
            id: element.id,
            width: newWidth,
            height: newHeight,
        });
    };

    const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
        const newX = e.target.x();
        const newY = e.target.y();
        onUpdate({
            id: element.id,
            x: newX,
            y: newY,
            location: translatePosition(newX, newY),
        });
    };

    return (
        <>
            <Group
                ref={groupRef}
                x={element.x}
                y={element.y}
                draggable
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
