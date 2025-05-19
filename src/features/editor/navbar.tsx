import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { dispatch } from "@designcombo/events";
import { HISTORY_UNDO, HISTORY_REDO, DESIGN_RESIZE } from "@designcombo/state";
import { Icons } from "@/components/shared/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Download, MenuIcon, ShareIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type StateManager from "@designcombo/state";
import { generateId } from "@designcombo/timeline";
import { IDesign } from "@designcombo/types";
import { useDownloadState } from "./store/use-download-state";
import DownloadProgressModal from "./download-progress-modal";
import AutosizeInput from "@/components/ui/autosize-input";
import { debounce } from "lodash";
import useStore from "./store/use-store";

export default function Navbar({
  stateManager,
  setProjectName,
  projectName,
}: {
  user: null;
  stateManager: StateManager;
  setProjectName: (name: string) => void;
  projectName: string;
}) {
  const [title, setTitle] = useState(projectName);

  const handleUndo = () => {
    dispatch(HISTORY_UNDO);
  };

  const handleRedo = () => {
    dispatch(HISTORY_REDO);
  };

  const handleCreateProject = async () => {};

  // Create a debounced function for setting the project name
  const debouncedSetProjectName = useCallback(
    debounce((name: string) => {
      console.log("Debounced setProjectName:", name);
      setProjectName(name);
    }, 2000), // 2 seconds delay
    [],
  );

  // Update the debounced function whenever the title changes
  useEffect(() => {
    debouncedSetProjectName(title);
  }, [title, debouncedSetProjectName]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "320px 1fr 320px",
      }}
      className="bg-sidebar pointer-events-none flex h-[58px] items-center border-b border-border/80 px-2"
    >
      <DownloadProgressModal />

      <div className="flex items-center gap-2">
        <div className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-md text-zinc-200">
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="hover:bg-background-subtle flex h-8 w-8 items-center justify-center">
                <MenuIcon className="h-5 w-5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[300] w-56 p-2" align="start">
              <DropdownMenuItem
                onClick={handleCreateProject}
                className="cursor-pointer text-muted-foreground"
              >
                New project
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-muted-foreground">
                My projects
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleCreateProject}
                className="cursor-pointer text-muted-foreground"
              >
                Duplicate project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center px-1.5">
          <Button
            onClick={handleUndo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.undo width={20} />
          </Button>
          <Button
            onClick={handleRedo}
            className="text-muted-foreground"
            variant="ghost"
            size="icon"
          >
            <Icons.redo width={20} />
          </Button>
        </div>
      </div>

      <div className="flex h-14 items-center justify-center gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5 text-muted-foreground">
          <AutosizeInput
            name="title"
            value={title}
            onChange={handleTitleChange}
            width={200}
            inputClassName="border-none outline-none px-1 bg-background text-sm font-medium text-zinc-200"
          />
        </div>
        <div className="bg-sidebar pointer-events-auto">
          <ViewportSelector />
        </div>
      </div>

      <div className="flex h-14 items-center justify-end gap-2">
        <div className="bg-sidebar pointer-events-auto flex h-12 items-center gap-2 rounded-md px-2.5">
          <Button
            className="flex h-8 gap-1 border border-border"
            variant="outline"
          >
            <ShareIcon width={18} /> Share
          </Button>
          <DownloadPopover stateManager={stateManager} />
          <Button
            className="flex h-8 gap-1 border border-border"
            variant="default"
            onClick={() => {
              window.open("https://discord.gg/jrZs3wZyM5", "_blank");
            }}
          >
            Discord
          </Button>
        </div>
      </div>
    </div>
  );
}

const DownloadPopover = ({ stateManager }: { stateManager: StateManager }) => {
  const { actions, exportType } = useDownloadState();
  const [isExportTypeOpen, setIsExportTypeOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleExport = () => {
    const data: IDesign = {
      id: generateId(),
      ...stateManager.getState(),
    };

    actions.setState({ payload: data });
    actions.startExport();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          className="flex h-8 gap-1 border border-border"
          variant="outline"
        >
          <Download width={18} /> Export
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="bg-sidebar z-[250] flex w-60 flex-col gap-4"
      >
        <Label>Export settings</Label>

        <Popover open={isExportTypeOpen} onOpenChange={setIsExportTypeOpen}>
          <PopoverTrigger asChild>
            <Button className="w-full justify-between" variant="outline">
              <div>{exportType.toUpperCase()}</div>
              <ChevronDown width={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="bg-background-subtle z-[251] w-[--radix-popover-trigger-width] px-2 py-2">
            <div
              className="flex h-8 items-center rounded-sm px-3 text-sm hover:cursor-pointer hover:bg-zinc-800"
              onClick={() => {
                actions.setExportType("mp4");
                setIsExportTypeOpen(false);
              }}
            >
              MP4
            </div>
            <div
              className="flex h-8 items-center rounded-sm px-3 text-sm hover:cursor-pointer hover:bg-zinc-800"
              onClick={() => {
                actions.setExportType("json");
                setIsExportTypeOpen(false);
              }}
            >
              JSON
            </div>
          </PopoverContent>
        </Popover>

        <div>
          <Button onClick={handleExport} className="w-full">
            Export
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ViewportSizeOption {
  label: string;
  width: number;
  height: number;
  description: string;
  category?: string;
  aspect?: string;
}

// Reorganize viewport options with categories and aspect ratios
const VIEWPORT_SIZES: ViewportSizeOption[] = [
  // Social Media - Standard
  {
    label: "Instagram Post (1080×1080)",
    width: 1080,
    height: 1080,
    description: "Square format for Instagram",
    category: "Social Media",
    aspect: "1:1",
  },
  {
    label: "Instagram Story (1080×1920)",
    width: 1080,
    height: 1920,
    description: "9:16 for Instagram Stories",
    category: "Social Media",
    aspect: "9:16",
  },
  {
    label: "TikTok/Reels (1080×1920)",
    width: 1080,
    height: 1920,
    description: "Vertical video for TikTok/Reels",
    category: "Social Media",
    aspect: "9:16",
  },
  {
    label: "Twitter (1200×675)",
    width: 1200,
    height: 675,
    description: "16:9 for Twitter posts",
    category: "Social Media",
    aspect: "16:9",
  },

  // Video Standards
  {
    label: "HD (1280×720)",
    width: 1280,
    height: 720,
    description: "720p HD video",
    category: "Video Standards",
    aspect: "16:9",
  },
  {
    label: "Full HD (1920×1080)",
    width: 1920,
    height: 1080,
    description: "1080p video, YouTube standard",
    category: "Video Standards",
    aspect: "16:9",
  },
  {
    label: "4K UHD (3840×2160)",
    width: 3840,
    height: 2160,
    description: "4K Ultra HD video",
    category: "Video Standards",
    aspect: "16:9",
  },
];

const ViewportSelector = () => {
  const { size } = useStore();
  const [currentOption, setCurrentOption] = useState<ViewportSizeOption | null>(
    null,
  );

  // Group options by category
  const groupedOptions = VIEWPORT_SIZES.reduce(
    (acc, option) => {
      const category = option.category || "Other";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(option);
      return acc;
    },
    {} as Record<string, ViewportSizeOption[]>,
  );

  // Categories in preferred order
  const categories = ["Video Standards", "Social Media", "Other"];

  // Find the matching preset or create a custom label
  useEffect(() => {
    const matchingOption = VIEWPORT_SIZES.find(
      (option) => option.width === size.width && option.height === size.height,
    );

    if (matchingOption) {
      setCurrentOption(matchingOption);
    } else {
      // Create a custom option for non-standard sizes
      setCurrentOption({
        label: `${size.width}×${size.height}`,
        width: size.width,
        height: size.height,
        description: "Custom size",
        aspect: `${size.width}:${size.height}`,
      });
    }
  }, [size]);

  const handleViewportChange = (option: ViewportSizeOption) => {
    dispatch(DESIGN_RESIZE, {
      payload: {
        width: option.width,
        height: option.height,
        name: option.label,
      },
    });
  };

  // Helper function to render aspect ratio icon
  const AspectRatioIcon = ({
    aspect,
    size = 16,
  }: {
    aspect: string;
    size?: number;
  }) => {
    const [width, height] = aspect.split(":").map(Number);
    const maxDimension = Math.max(width, height);
    const scaledWidth = (width / maxDimension) * size;
    const scaledHeight = (height / maxDimension) * size;

    return (
      <div
        style={{
          width: scaledWidth,
          height: scaledHeight,
          backgroundColor: "rgba(255,255,255,0.7)",
          marginRight: 8,
          minWidth: 8,
          minHeight: 8,
        }}
      />
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="flex items-center gap-2 border border-border"
          variant="secondary"
        >
          {currentOption?.aspect && (
            <AspectRatioIcon aspect={currentOption.aspect} />
          )}
          <span>{currentOption?.label || "Loading..."}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[250] w-72">
        {categories.map((category) => {
          const options = groupedOptions[category];
          if (!options || options.length === 0) return null;

          return (
            <div key={category} className="mb-2">
              <div className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
                {category}
              </div>
              {options.map((option, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={() => handleViewportChange(option)}
                  className="flex cursor-pointer items-center py-2"
                >
                  {option.aspect && (
                    <div className="mr-2 flex-shrink-0">
                      <AspectRatioIcon aspect={option.aspect} size={20} />
                    </div>
                  )}
                  <div className="flex flex-col">
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {option.description}
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
