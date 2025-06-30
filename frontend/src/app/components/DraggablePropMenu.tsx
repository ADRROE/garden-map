// DraggablePropMenu.tsx
"use client";
import React, { useRef } from "react";
import Draggable from "react-draggable";
import PropMenu from "./PropMenu"; // adjust import
import type { PropMenuProps } from "./PropMenu"; // optional, but helpful

export default function DraggablePropMenu(props: PropMenuProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

  return (
    <Draggable handle=".prop-menu-header" nodeRef={nodeRef}>
      <div ref={nodeRef} className="fixed top-4 right-4 z-50" >
        <PropMenu {...props} />
      </div>
    </Draggable>
  );
}