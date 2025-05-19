import React, { ReactNode } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useDraggable } from "@dnd-kit/core";

interface DraggableProps {
  children: ReactNode;
  handleClassName?: string;
  id: string;
}

interface DraggableContentProps extends DraggableProps {
  children: React.ReactElement;
}

function DraggableContent({
  children,
  handleClassName,
  id,
}: DraggableContentProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
  });

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined;

  // Create a wrapper to handle drag events
  const wrapper = (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
    </div>
  );

  // If there's a handle specified, find it and apply the listeners
  if (handleClassName) {
    const findAndAttachToHandle = (
      children: React.ReactNode,
    ): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // If this is the handle, attach listeners
        if (
          child.props.className &&
          child.props.className.includes(handleClassName)
        ) {
          return React.cloneElement(child, {
            ...child.props,
            ...listeners,
          });
        }

        // If it has children, recursively search
        if (child.props.children) {
          const newChildren = findAndAttachToHandle(child.props.children);
          return React.cloneElement(child, {
            ...child.props,
            children: newChildren,
          });
        }

        return child;
      });
    };

    const childrenWithHandlers = findAndAttachToHandle(children);
    if (React.isValidElement(childrenWithHandlers)) {
      return (
        <div ref={setNodeRef} style={style} {...attributes}>
          {childrenWithHandlers}
        </div>
      );
    }
  }

  // If no handle, make the whole thing draggable
  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}

export default function DraggableWrapper({
  children,
  handleClassName,
  id = "draggable",
}: DraggableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  if (!React.isValidElement(children)) {
    return children;
  }

  return (
    <DndContext sensors={sensors} onDragEnd={() => {}}>
      <DraggableContent id={id} handleClassName={handleClassName}>
        {children}
      </DraggableContent>
    </DndContext>
  );
}
