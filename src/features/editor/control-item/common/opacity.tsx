import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { THROTTLE_WAIT_MS } from "./constants";

const Opacity = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const throttledOnChange = useThrottledCallback(onChange, {
    wait: THROTTLE_WAIT_MS,
  });

  return (
    <div className="flex gap-2">
      <div className="flex flex-1 items-center text-sm text-muted-foreground">
        Opacity
      </div>
      <div
        className="w-32"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px",
        }}
      >
        <Input
          max={100}
          variant="secondary"
          className="h-8 w-11 px-2 text-center text-sm"
          type="number"
          onChange={(e) => {
            const newValue = Number(e.target.value);
            if (newValue >= 0 && newValue <= 100) {
              throttledOnChange(newValue);
            }
          }}
          value={value}
        />
        <Slider
          id="opacity"
          value={[value]}
          onValueChange={(e) => {
            throttledOnChange(e[0]);
          }}
          min={0}
          max={100}
          step={1}
          aria-label="Opacity"
        />
      </div>
    </div>
  );
};

export default Opacity;
