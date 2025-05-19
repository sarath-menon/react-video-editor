import { Player as RemotionPlayer, PlayerRef } from "@remotion/player";
import Composition from "@/features/editor/player/composition";
import useStore from "@/features/editor/store/use-store";

const Player = () => {
  const { setPlayerRef, duration, fps, size } = useStore();

  // Set the player ref when it's available
  const handlePlayerRef = (ref: PlayerRef | null) => {
    if (ref) {
      setPlayerRef({ current: ref });
    }
  };

  return (
    <RemotionPlayer
      ref={handlePlayerRef}
      component={Composition}
      durationInFrames={Math.round((duration / 1000) * fps) || 1}
      compositionWidth={size.width}
      compositionHeight={size.height}
      className="h-full w-full"
      fps={30}
      overflowVisible
      style={{
        willChange: "transform", // Optimize for transforms
        backfaceVisibility: "hidden", // Prevent flickering during transforms
      }}
    />
  );
};

export default Player;
