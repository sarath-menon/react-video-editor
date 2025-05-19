import { IImage, ITrackItem, IVideo } from "@designcombo/types";
import { FileText } from "lucide-react";
import { useEffect, useState } from "react";

interface MediaProperties {
  width?: number;
  height?: number;
  format?: string;
  size?: string;
  src?: string;
}

interface MediaPropertiesProps {
  trackItem: ITrackItem & (IImage | IVideo);
}

const MediaProperties = ({ trackItem }: MediaPropertiesProps) => {
  const [properties, setProperties] = useState<MediaProperties>({});

  useEffect(() => {
    if (trackItem?.details?.src) {
      // Extract file extension from the source URL
      const src = trackItem.details.src;
      const format = src.split(".").pop()?.toUpperCase() || "Unknown";

      // Set the known properties
      setProperties({
        width: trackItem.details.width,
        height: trackItem.details.height,
        format,
        src,
      });
    }
  }, [trackItem]);

  return (
    <div className="mb-4 flex flex-col gap-2 rounded-md bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        <FileText size={14} />
        <span>Properties</span>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
        {properties.width && properties.height && (
          <>
            <span className="text-muted-foreground">Dimensions:</span>
            <span>
              {properties.width} × {properties.height}px
            </span>
          </>
        )}

        {properties.format && (
          <>
            <span className="text-muted-foreground">Format:</span>
            <span>{properties.format}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default MediaProperties;
