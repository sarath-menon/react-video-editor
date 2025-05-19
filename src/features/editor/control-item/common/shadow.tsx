import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IBoxShadow } from "@designcombo/types";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ColorPicker from "@/components/color-picker";
import { X } from "lucide-react";
import { DndDraggable, DndProvider } from "../../components/DndDraggable";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { THROTTLE_WAIT_MS } from "./constants";
import { useState } from "react";

function Shadow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: IBoxShadow;
  onChange: (v: IBoxShadow) => void;
}) {
  const [open, setOpen] = useState(false);

  const throttledOnChange = useThrottledCallback(onChange, {
    wait: THROTTLE_WAIT_MS,
  });

  return (
    <div className="flex flex-col gap-2 py-4">
      <Label className="font-sans text-xs font-semibold text-primary">
        {label}
      </Label>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          Color
        </div>

        <div className="relative w-32">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <div className="relative">
                <div
                  style={{ backgroundColor: value.color }}
                  className="absolute left-0.5 top-0.5 h-7 w-7 flex-none cursor-pointer rounded-md border border-border"
                ></div>

                <Input
                  variant="secondary"
                  className="pointer-events-none h-8 pl-10"
                  value={value.color}
                  onChange={() => {}}
                />
              </div>
            </PopoverTrigger>

            <DndProvider>
              <PopoverContent className="absolute bottom-[-3.5rem] right-[460px] z-[300] w-full p-0">
                <DndDraggable
                  id="shadow-color-picker"
                  handle={true}
                  handleClassName="drag-handle"
                >
                  <div>
                    <div className="drag-handle flex w-[266px] cursor-grab justify-between rounded-t-lg bg-popover px-4 pt-4">
                      <p className="text-sm font-bold">Shadow</p>
                      <div
                        className="h-4 w-4"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        <X className="h-4 w-4 cursor-pointer font-extrabold text-muted-foreground" />
                      </div>
                    </div>
                    <ColorPicker
                      value={value.color}
                      format="hex"
                      gradient={true}
                      solid={true}
                      onChange={(v) => {
                        throttledOnChange({
                          ...value,
                          color: v,
                        });
                      }}
                      allowAddGradientStops={true}
                    />
                  </div>
                </DndDraggable>
              </PopoverContent>
            </DndProvider>
          </Popover>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          X
        </div>
        <div className="relative w-32">
          <Input
            variant="secondary"
            className="h-8"
            value={value.x}
            onChange={(e) => {
              const newValue = e.target.value;

              // Allow empty string or validate as a number
              if (
                newValue === "" ||
                (!isNaN(Number(newValue)) && Number(newValue) >= 0)
              ) {
                // Only propagate if it's a valid number and not empty
                if (newValue !== "") {
                  throttledOnChange({
                    ...value,
                    x: Number(newValue),
                  });
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          Y
        </div>
        <div className="relative w-32">
          <Input
            variant="secondary"
            className="h-8"
            value={value.y}
            onChange={(e) => {
              const newValue = e.target.value;

              // Allow empty string or validate as a number
              if (
                newValue === "" ||
                (!isNaN(Number(newValue)) && Number(newValue) >= 0)
              ) {
                // Only propagate if it's a valid number and not empty
                if (newValue !== "") {
                  throttledOnChange({
                    ...value,
                    y: Number(newValue),
                  });
                }
              }
            }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center text-sm text-muted-foreground">
          Blur
        </div>
        <div className="relative w-32">
          <Input
            variant="secondary"
            className="h-8"
            value={value.blur}
            onChange={(e) => {
              const newValue = e.target.value;

              // Allow empty string or validate as a number
              if (
                newValue === "" ||
                (!isNaN(Number(newValue)) && Number(newValue) >= 0)
              ) {
                // Only propagate if it's a valid number and not empty
                if (newValue !== "") {
                  throttledOnChange({
                    ...value,
                    blur: Number(newValue),
                  });
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default Shadow;
