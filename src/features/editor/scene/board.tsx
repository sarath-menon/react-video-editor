import { useState } from "react";
import { DroppableArea } from "./droppable";

const SceneBoard = ({
  size,
  children,
}: {
  size: { width: number; height: number };
  children: React.ReactNode;
}) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  return (
    <div className="scene-board-container" style={{ position: "relative" }}>
      <DroppableArea
        id="artboard"
        onDragStateChange={setIsDraggingOver}
        style={{
          width: size.width,
          height: size.height,
          overflow: "hidden",
          position: "relative",
          contain: "strict", // CSS containment for better performance
        }}
        className="pointer-events-auto"
      >
        {/* Viewport border */}
        <div
          className={`viewport-border ${isDraggingOver ? "dragging-over" : ""}`}
          style={{
            position: "absolute",
            inset: 0,
            border: isDraggingOver
              ? "4px dashed white"
              : "1px solid rgba(255, 255, 255, 0.15)",
            backgroundColor: isDraggingOver
              ? "rgba(255, 255, 255, 0.075)"
              : "transparent",
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
        {/* Content container */}
        {children}
      </DroppableArea>
      {/* Background mask as a sibling rather than using a huge shadow */}
      <div
        className="background-mask"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#121213",
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default SceneBoard;
