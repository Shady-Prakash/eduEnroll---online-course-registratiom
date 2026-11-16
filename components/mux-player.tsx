"use client";

import type { ComponentProps, CSSProperties } from "react";
import dynamic from "next/dynamic";
import { theme } from "@/lib/design-tokens";

/**
 * Lazily loaded Mux player. The player bundle is large and browser-only,
 * so it is split into its own chunk and only fetched on pages that play video.
 */
const LazyMuxPlayer = dynamic(() => import("@mux/mux-player-react"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-ink-800" />,
});

type MuxPlayerProps = ComponentProps<typeof LazyMuxPlayer>;

/**
 * Fixed-frame player: always fills its parent (use a `relative aspect-video` box)
 * instead of resizing to each video's own dimensions. Portrait, square or
 * ultra-wide videos are letterboxed inside the frame, so the layout never jumps.
 */
export const MuxPlayer = ({ style, className, ...props }: MuxPlayerProps) => (
  <LazyMuxPlayer
    {...props}
    className={className}
    style={
      {
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        aspectRatio: "auto",
        "--media-object-fit": "contain",
        "--media-object-position": "center",
        "--controls-backdrop-color": "rgb(0 0 0 / 0.4)",
        backgroundColor: theme.videoBackdrop, // letterbox
        ...style,
      } as CSSProperties
    }
  />
);
