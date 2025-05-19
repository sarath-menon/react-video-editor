import React, { ReactNode } from "react";
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
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

  // If there's a handle specified, find it and apply the listeners
  if (handleClassName) {
    const findAndAttachToHandle = (
      children: React.ReactNode,
    ): React.ReactNode => {
      return React.Children.map(children, (child) => {
        if (!React.isValidElement(child)) return child;

        // TypeScript specific type assertion for props
        type ElementProps = {
          className?: string;
          children?: React.ReactNode;
          [key: string]: unknown;
        };

        const typedChild = child as React.ReactElement<ElementProps>;
        const props = typedChild.props;

        // If this is the handle, attach listeners
        if (props.className && props.className.includes(handleClassName)) {
          return React.cloneElement(typedChild, {
            ...props,
            ...listeners,
          });
        }

        // If it has children, recursively search
        if (props.children) {
          const newChildren = findAndAttachToHandle(props.children);
          return React.cloneElement(typedChild, {
            ...props,
            children: newChildren,
          });
        }

        return typedChild;
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
