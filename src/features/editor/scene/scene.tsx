import { Player } from "../player";
import { useRef, useState, useEffect } from "react";
import useStore from "../store/use-store";
import StateManager from "@designcombo/state";
import SceneEmpty from "./empty";
import Board from "./board";
import { SceneInteractions } from "./interactions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Preset zoom levels like Final Cut Pro
const ZOOM_LEVELS = [
  { label: "25%", value: 0.25 },
  { label: "50%", value: 0.5 },
  { label: "75%", value: 0.75 },
  { label: "100%", value: 1 },
  { label: "150%", value: 1.5 },
  { label: "200%", value: 2 },
  { label: "300%", value: 3 },
  { label: "400%", value: 4 },
];

export default function Scene({
  stateManager,
}: {
  stateManager: StateManager;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  const { size, trackItemIds } = useStore();
  const [zoom, setZoom] = useState(1);

  // Calculate initial zoom based on container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const PADDING = 96;
    const containerHeight = container.clientHeight - PADDING;
    const containerWidth = container.clientWidth - PADDING;
    const { width, height } = size;

    // For portrait videos (height > width), prioritize fitting to height
    // For landscape videos (width > height), prioritize fitting to width
    const desiredZoom =
      height > width ? containerHeight / height : containerWidth / width;

    // Find the closest preset zoom level
    let closestZoom = ZOOM_LEVELS[0].value;
    let minDiff = Math.abs(desiredZoom - closestZoom);

    for (const level of ZOOM_LEVELS) {
      const diff = Math.abs(desiredZoom - level.value);
      if (diff < minDiff) {
        minDiff = diff;
        closestZoom = level.value;
      }
    }

    setZoom(closestZoom);
  }, [size]);

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
    >
      {/* Zoom dropdown in top right */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 100,
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium">
            {ZOOM_LEVELS.find((level) => level.value === zoom)?.label ||
              `${Math.round(zoom * 100)}%`}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {ZOOM_LEVELS.map((level) => (
              <DropdownMenuItem
                key={level.value}
                onClick={() => setZoom(level.value)}
                className="cursor-pointer"
              >
                {level.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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
