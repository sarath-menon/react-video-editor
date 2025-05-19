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
  const [isDragging, setIsDragging] = useState(false);
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
      const { fps } = useStore.getState();
      const seekedTime = (v.detail.frame / fps) * 1000;
      updateTargets(seekedTime);
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
    const handlePointerDown = (e: PointerEvent) => {
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

    const handlePointerMove = (e: PointerEvent) => {
      if (!isSelecting) return;

      // Use requestAnimationFrame for smoother selection box updates
      requestAnimationFrame(() => {
        const currentX = e.clientX;
        const currentY = e.clientY;

        setSelectionBox({
          x: Math.min(startPos.x, currentX),
          y: Math.min(startPos.y, currentY),
          width: Math.abs(currentX - startPos.x),
          height: Math.abs(currentY - startPos.y),
        });
      });
    };

    const handlePointerUp = () => {
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
        // Use a more efficient selector
        const items = container.querySelectorAll(".designcombo-scene-item");

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

    // Use pointer events instead of mouse events for better multi-device support
    container.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
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

  // Handle dragging selected elements with improved performance
  useEffect(() => {
    if (!targets.length) return;

    // Add draggable cursor class to selected elements
    targets.forEach((target) => {
      target.classList.add("designcombo-draggable");
    });

    // Prepare initial element positions and transforms
    const elementsData = new Map<
      HTMLDivElement,
      {
        id: string;
        initialLeft: number;
        initialTop: number;
        transform: { x: number; y: number };
      }
    >();

    targets.forEach((target) => {
      const id = getIdFromClassName(target.className);
      const initialLeft = parseFloat(target.style.left) || 0;
      const initialTop = parseFloat(target.style.top) || 0;

      elementsData.set(target, {
        id,
        initialLeft,
        initialTop,
        transform: { x: 0, y: 0 },
      });
    });

    let localIsDragging = false;
    let startX = 0;
    let startY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      const sceneItem = target.closest(".designcombo-scene-item");

      if (!sceneItem || !elementsData.has(sceneItem as HTMLDivElement)) return;

      e.preventDefault();
      e.stopPropagation();

      // Set pointer capture for reliable tracking even if pointer leaves the window
      (e.target as HTMLElement).setPointerCapture(e.pointerId);

      localIsDragging = true;
      setIsDragging(true);
      startX = e.clientX;
      startY = e.clientY;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!localIsDragging) return;

      // Calculate movement delta
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      // Use requestAnimationFrame for smooth animation
      requestAnimationFrame(() => {
        elementsData.forEach((data, element) => {
          // Use transform for better performance
          element.style.transform = `translate(${dx}px, ${dy}px)`;
          data.transform = { x: dx, y: dy };
        });
      });
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!localIsDragging) return;

      // Release pointer capture
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);

      localIsDragging = false;
      setIsDragging(false);

      // Commit changes to the actual top/left styles and reset transforms
      const payload: Record<
        string,
        { details: { left: string; top: string } }
      > = {};

      elementsData.forEach((data, element) => {
        const newLeft = data.initialLeft + data.transform.x;
        const newTop = data.initialTop + data.transform.y;

        // Update the element's position
        element.style.left = `${newLeft}px`;
        element.style.top = `${newTop}px`;
        element.style.transform = "";

        // Prepare payload for state update
        payload[data.id] = {
          details: {
            left: `${newLeft}px`,
            top: `${newTop}px`,
          },
        };
      });

      // Dispatch changes to store
      dispatch(EDIT_OBJECT, { payload });
    };

    // Attach event listeners for dragging
    targets.forEach((target) => {
      target.addEventListener("pointerdown", handlePointerDown);
    });
    document.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    document.addEventListener("pointerup", handlePointerUp);
    document.addEventListener("pointercancel", handlePointerUp);

    return () => {
      // Remove draggable cursor class when targets change or component unmounts
      targets.forEach((target) => {
        target.classList.remove("designcombo-draggable");
        target.removeEventListener("pointerdown", handlePointerDown);
      });
      document.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("pointerup", handlePointerUp);
      document.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [targets, zoom]);

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

      {/* Selection boxes around selected elements */}
      {!isDragging &&
        targets.map((target, index) => {
          return (
            <div
              key={`selection-${index}`}
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                width: target.offsetWidth + "px",
                height: target.offsetHeight + "px",
                transform: `translate(${target.style.left}, ${target.style.top})`,
                border: "2px solid #00a0ff",
                borderRadius: "2px",
                pointerEvents: "none",
                zIndex: 999,
                boxSizing: "border-box",
              }}
            />
          );
        })}
    </>
  );
}
