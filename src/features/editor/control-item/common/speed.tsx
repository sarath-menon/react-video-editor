import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { useThrottledCallback } from "@tanstack/react-pacer";
import { THROTTLE_WAIT_MS } from "./constants";

const Speed = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => {
  const throttledOnChange = useThrottledCallback(onChange, {
    wait: THROTTLE_WAIT_MS,
  });

  const handleBlur = (inputValue: string) => {
    if (inputValue !== "") {
      throttledOnChange(Number(inputValue));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    inputValue: string,
  ) => {
    if (e.key === "Enter") {
      if (inputValue !== "") {
        throttledOnChange(Number(inputValue));
      }
    }
  };

  return (
    <div className="flex gap-2">
      <div className="flex flex-1 items-center text-sm text-muted-foreground">
        Speed
      </div>
      <div
        className="w-32"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 80px",
        }}
      >
        <Input
          variant="secondary"
          className="h-8 w-11 px-2 text-center text-sm"
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;

            // Allow empty string or validate as a number
            if (
              newValue === "" ||
              (!isNaN(Number(newValue)) && Number(newValue) >= 0)
            ) {
              // If it's a valid numeric value, update immediately
              if (newValue !== "" && !isNaN(Number(newValue))) {
                throttledOnChange(Number(newValue));
              }
            }
          }}
          onBlur={(e) => handleBlur(e.target.value)}
          onKeyDown={(e) => handleKeyDown(e, e.currentTarget.value)}
        />
        <Slider
          id="opacity"
          value={[value]}
          onValueChange={(e) => {
            throttledOnChange(e[0]);
          }}
          min={0}
          max={4}
          step={0.1}
          aria-label="Speed"
        />
      </div>
    </div>
  );
};

export default Speed;
