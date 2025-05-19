import React, { ReactNode } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";
import { useDraggable } from "@dnd-kit/core";

type DraggableProps = {
  id: string;
  children: ReactNode;
  handle?: boolean;
  handleClassName?: string;
};

interface DragHandleProps {
  listeners: ReturnType<typeof useDraggable>["listeners"];
  handleClassName: string;
}

export function DndDraggable({
  id,
  children,
  handle = false,
  handleClassName,
}: DraggableProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Simple case: whole component is draggable (no handle)
  if (!handle) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, position: "relative" }}
        {...listeners}
        {...attributes}
      >
        {children}
      </div>
    );
  }

  // Handle case: Only the handle element is draggable
  return (
    <div
      ref={setNodeRef}
      style={{ ...style, position: "relative" }}
      {...attributes}
    >
      {React.isValidElement(children) && handleClassName
        ? React.cloneElement(children, {
            // TypeScript sees this as unsafe, but we use a proper interface for consumers
            // @ts-expect-error - Add dragHandleProps for consumer components to apply to handles
            dragHandleProps: {
              listeners,
              handleClassName,
            } as DragHandleProps,
          })
        : children}
    </div>
  );
}

export function DndProvider({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
  );

  return (
    <DndContext
      id={id || "draggable-context"}
      sensors={sensors}
      modifiers={[restrictToWindowEdges]}
    >
      {children}
    </DndContext>
  );
}
