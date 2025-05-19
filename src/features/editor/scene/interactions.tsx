import { useEffect, useRef, useState } from "react";
import { getIdFromClassName } from "../utils/scene";
import { dispatch } from "@designcombo/events";
import { EDIT_OBJECT } from "@designcombo/state";
import { getTargetById } from "../utils/target";
import useStore from "../store/use-store";
import StateManager from "@designcombo/state";
import { getCurrentTime } from "../utils/time";

interface SceneInteractionsProps {
  stateManager: StateManager;
  containerRef: React.RefObject<HTMLDivElement>;
  boardContainerRef: React.RefObject<HTMLDivElement>;
  zoom: number;
  size: { width: number; height: number };
}

export function SceneInteractions({
  stateManager,
  boardContainerRef,
  zoom,
}: Omit<SceneInteractionsProps, "containerRef">) {
  const [targets, setTargets] = useState<HTMLDivElement[]>([]);
  const selectionBoxRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [selectionBox, setSelectionBox] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const { activeIds, setState, trackItemsMap, playerRef } = useStore();

  // Update targets based on player time
  useEffect(() => {
    const updateTargets = (time?: number) => {
      const currentTime = time || getCurrentTime();
      const { trackItemsMap } = useStore.getState();
      const targetIds = activeIds.filter((id) => {
        return (
          trackItemsMap[id]?.display.from <= currentTime &&
          trackItemsMap[id]?.display.to >= currentTime
        );
      });
      const selectedElements = targetIds
        .map((id) => getTargetById(id) as HTMLDivElement)
        .filter(Boolean);

      setTargets(selectedElements);
    };

    const timer = setTimeout(() => {
      updateTargets();
    });

    const onSeeked = (v: { detail: { frame: number } }) => {
      setTimeout(() => {
        const { fps } = useStore.getState();
        const seekedTime = (v.detail.frame / fps) * 1000;
        updateTargets(seekedTime);
      });
    };
    playerRef?.current?.addEventListener("seeked", onSeeked);

    return () => {
      playerRef?.current?.removeEventListener("seeked", onSeeked);
      clearTimeout(timer);
    };
  }, [activeIds, playerRef, trackItemsMap]);

  // Selection and dragging functionality
  useEffect(() => {
    const container = boardContainerRef.current;
    if (!container) return;

    // Handle selection box
    const handleMouseDown = (e: MouseEvent) => {
      // Check if clicking on a scene item or its child elements
      const target = e.target as HTMLElement;
      const closestSceneItem = target.closest(".designcombo-scene-item");

      if (closestSceneItem) {
        // This is a click on a scene item
        const id = getIdFromClassName(closestSceneItem.className);

        // Update active selection in state
        stateManager.updateState(
          { activeIds: [id] },
          { updateHistory: false, kind: "layer:selection" },
        );

        setTargets([closestSceneItem as HTMLDivElement]);
        e.stopPropagation();
      } else {
        // This is a selection box on empty space
        setIsSelecting(true);
        setStartPos({ x: e.clientX, y: e.clientY });
        setSelectionBox({ x: e.clientX, y: e.clientY, width: 0, height: 0 });
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isSelecting) return;

      const currentX = e.clientX;
      const currentY = e.clientY;

      setSelectionBox({
        x: Math.min(startPos.x, currentX),
        y: Math.min(startPos.y, currentY),
        width: Math.abs(currentX - startPos.x),
        height: Math.abs(currentY - startPos.y),
      });
    };

    const handleMouseUp = () => {
      if (!isSelecting) return;
      setIsSelecting(false);

      // Find elements within selection box
      if (selectionBox.width > 5 && selectionBox.height > 5) {
        const boxRect = {
          left: selectionBox.x,
          top: selectionBox.y,
          right: selectionBox.x + selectionBox.width,
          bottom: selectionBox.y + selectionBox.height,
        };

        const selectedElements: HTMLDivElement[] = [];
        const items = document.querySelectorAll(".designcombo-scene-item");

        items.forEach((item) => {
          const rect = item.getBoundingClientRect();
          if (
            rect.left < boxRect.right &&
            rect.right > boxRect.left &&
            rect.top < boxRect.bottom &&
            rect.bottom > boxRect.top
          ) {
            selectedElements.push(item as HTMLDivElement);
          }
        });

        // Update selection
        const ids = selectedElements.map((el) =>
          getIdFromClassName(el.className),
        );
        stateManager.updateState(
          { activeIds: ids },
          { updateHistory: false, kind: "layer:selection" },
        );
        setTargets(selectedElements);
      } else if (selectionBox.width < 5 && selectionBox.height < 5) {
        // Clear selection when clicking empty space
        stateManager.updateState(
          { activeIds: [] },
          { updateHistory: false, kind: "layer:selection" },
        );
        setTargets([]);
      }
    };

    container.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      container.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [boardContainerRef, isSelecting, startPos, selectionBox, stateManager]);

  // Active IDs subscription
  useEffect(() => {
    const activeSelectionSubscription = stateManager.subscribeToActiveIds(
      (newState) => {
        setState(newState);
      },
    );

    return () => {
      activeSelectionSubscription.unsubscribe();
    };
  }, [stateManager, setState]);

  // Handle dragging selected elements
  useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const sceneItem = target.closest(".designcombo-scene-item");

      if (!sceneItem || targets.length === 0) return;

      // Check if the clicked item is part of the selection
      if (!targets.includes(sceneItem as HTMLDivElement)) return;

      const initialPositions = targets.map((item) => {
        const rect = item.getBoundingClientRect();
        return {
          element: item,
          initialX: rect.left,
          initialY: rect.top,
          currentX: e.clientX,
          currentY: e.clientY,
        };
      });

      const handleDragMove = (moveEvent: MouseEvent) => {
        const dx = moveEvent.clientX - e.clientX;
        const dy = moveEvent.clientY - e.clientY;

        initialPositions.forEach((item) => {
          const left = item.initialX + dx;
          const top = item.initialY + dy;
          item.element.style.left = `${left}px`;
          item.element.style.top = `${top}px`;
        });
      };

      const handleDragEnd = () => {
        // Update positions in store
        const payload: Record<
          string,
          { details: { left: string; top: string } }
        > = {};

        initialPositions.forEach((item) => {
          const id = getIdFromClassName(item.element.className);
          payload[id] = {
            details: {
              left: item.element.style.left,
              top: item.element.style.top,
            },
          };
        });

        dispatch(EDIT_OBJECT, { payload });

        document.removeEventListener("mousemove", handleDragMove);
        document.removeEventListener("mouseup", handleDragEnd);
      };

      document.addEventListener("mousemove", handleDragMove);
      document.addEventListener("mouseup", handleDragEnd);
    };

    // Attach event listeners for dragging
    targets.forEach((target) => {
      target.addEventListener("mousedown", handleMouseDown);
    });

    return () => {
      targets.forEach((target) => {
        target.removeEventListener("mousedown", handleMouseDown);
      });
    };
  }, [targets]);

  return (
    <>
      {isSelecting && (
        <div
          ref={selectionBoxRef}
          style={{
            position: "fixed",
            left: selectionBox.x + "px",
            top: selectionBox.y + "px",
            width: selectionBox.width + "px",
            height: selectionBox.height + "px",
            border: "1px solid #00a0ff",
            backgroundColor: "rgba(0, 160, 255, 0.1)",
            pointerEvents: "none",
            zIndex: 1000,
          }}
        />
      )}
      {targets.map((target, index) => (
        <div
          key={index}
          className="resize-handle-container"
          style={{
            position: "absolute",
            left: target.style.left,
            top: target.style.top,
            width: target.offsetWidth + "px",
            height: target.offsetHeight + "px",
            border: "1px solid #00a0ff",
            pointerEvents: "none",
            zIndex: 999,
            transform: `scale(${1 / zoom})`,
          }}
        >
          {/* Resize handles would go here */}
        </div>
      ))}
    </>
  );
}
