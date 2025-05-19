import React from "react";
import {
  IAudio,
  ICaption,
  IImage,
  IText,
  ITrackItem,
  ITrackItemAndDetails,
  IVideo,
} from "@designcombo/types";
import { useEffect, useState } from "react";
import BasicText from "./basic-text";
import BasicImage from "./basic-image";
import BasicVideo from "./basic-video";
import BasicAudio from "./basic-audio";
import useStore from "../store/use-store";
import useLayoutStore from "../store/use-layout-store";
import BasicCaption from "./basic-caption";
import { LassoSelect } from "lucide-react";

const Container = ({ children }: { children: React.ReactNode }) => {
  const { activeIds, trackItemsMap, trackItemDetailsMap, transitionsMap } =
    useStore();
  const [trackItem, setTrackItem] = useState<ITrackItemAndDetails | null>(null);
  const { setTrackItem: setLayoutTrackItem } = useLayoutStore();

  useEffect(() => {
    if (activeIds.length === 1) {
      const [id] = activeIds;
      const trackItemDetails = trackItemDetailsMap[id];
      if (trackItemDetails) {
        const fullTrackItem = {
          ...trackItemsMap[id],
          details: trackItemDetails?.details || {},
        } as ITrackItemAndDetails;
        setTrackItem(fullTrackItem);
        setLayoutTrackItem(fullTrackItem);
      } else if (transitionsMap[id]) {
        // Handle transitions if needed
      }
    } else {
      setTrackItem(null);
      setLayoutTrackItem(null);
    }
  }, [
    activeIds,
    trackItemsMap,
    trackItemDetailsMap,
    transitionsMap,
    setLayoutTrackItem,
  ]);

  return (
    <div className="bg-sidebar flex w-[272px] flex-none border-l border-border/80">
      {React.cloneElement(
        children as React.ReactElement<{ trackItem?: ITrackItemAndDetails }>,
        {
          trackItem,
        },
      )}
    </div>
  );
};

const ActiveControlItem = ({
  trackItem,
}: {
  trackItem?: ITrackItemAndDetails;
}) => {
  if (!trackItem) {
    return (
      <div className="mb-32 flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
        <LassoSelect />
        <span className="text-zinc-500">No item selected</span>
      </div>
    );
  }
  return (
    <>
      {
        {
          text: <BasicText trackItem={trackItem as ITrackItem & IText} />,
          caption: (
            <BasicCaption trackItem={trackItem as ITrackItem & ICaption} />
          ),
          image: <BasicImage trackItem={trackItem as ITrackItem & IImage} />,
          video: <BasicVideo trackItem={trackItem as ITrackItem & IVideo} />,
          audio: <BasicAudio trackItem={trackItem as ITrackItem & IAudio} />,
        }[trackItem.type as "text"]
      }
    </>
  );
};

export const ControlItem = () => {
  return (
    <Container>
      <ActiveControlItem />
    </Container>
  );
};
