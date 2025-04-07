"use client";

import React, { useRef, useEffect } from "react";
import { Image, Transformer, Group, Text } from "react-konva";
import useImage from "use-image";
import { DraggableElementProps } from "../types";


const DraggableElement: React.FC<DraggableElementProps> = ({ element, onUpdate, onSelect, isSelected, onDelete }) => {
    const [image] = useImage(element.icon); // Load icon as image

    const imageRef = useRef<any>(null);
    const transformerRef = useRef<any>(null);

    useEffect(() => {
        if (isSelected && transformerRef.current) {
            transformerRef.current.nodes([imageRef.current]);
            transformerRef.current.getLayer().batchDraw();
        }
    }, [isSelected]);

    const handleTransformEnd = () => {
        const node = imageRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        
        onUpdate({
            id: element.id,
            width: node.width() * scaleX,
            height: node.height() * scaleY,
        })

        node.scaleX(1);
        node.scaleY(1);
    }

    return (
        <>
      <Group
        x={element.x}
        y={element.y}
        draggable
        onClick={onSelect}
        onDragEnd={(e) =>
          onUpdate({ id: element.id, x: e.target.x(), y: e.target.y() })
        }
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
          />
        )}
      </Group>
        {isSelected && 
            <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) {
                  return oldBox;
                }
                return newBox;
              }}>
            
            </Transformer>}
        
        </>
    );
};

export default DraggableElement;
