import { Player } from "../player";
import { useRef, useEffect } from "react";
import useStore from "../store/use-store";
import StateManager from "@designcombo/state";
import SceneEmpty from "./empty";
import Board from "./board";
import useZoom from "../hooks/use-zoom";
import { SceneInteractions } from "./interactions";

export default function Scene({
  stateManager,
}: {
  stateManager: StateManager;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { size, trackItemIds } = useStore();
  const { zoom, handleZoomChange } = useZoom(containerRef, size);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      handleZoomChange(e.deltaY);
    }
  };

  // Prevent browser zoom on Ctrl/Cmd+wheel
  const preventDefaultZoom = (e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    document.addEventListener("wheel", preventDefaultZoom, { passive: false });
    return () => {
      document.removeEventListener("wheel", preventDefaultZoom);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        flex: 1,
        overflow: "hidden",
      }}
      ref={containerRef}
      onWheel={handleWheel}
    >
      {trackItemIds.length === 0 && <SceneEmpty />}
      <div
        className="player-container bg-sidebar"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          ref={boardContainerRef}
          style={{
            transform: `scale(${zoom})`,
            transition: "transform 0.1s ease-out",
          }}
        >
          <Board size={size}>
            <Player />
            <SceneInteractions
              stateManager={stateManager}
              boardContainerRef={boardContainerRef}
              zoom={zoom}
              size={size}
            />
          </Board>
        </div>
      </div>
    </div>
  );
}
