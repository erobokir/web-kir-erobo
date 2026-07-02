"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Props = Omit<ImageProps, "onLoadingComplete" | "onLoad"> & {
  wrapperClassName?: string;
};

/**
 * Drop-in replacement for next/image that shows a pulsing hex-toned
 * skeleton until the image has actually finished loading. Works for both
 * `fill` and fixed width/height images.
 */
export default function ImageWithSkeleton({
  wrapperClassName = "",
  className = "",
  alt,
  ...props
}: Props) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className={`relative block h-full w-full overflow-hidden ${wrapperClassName}`}>
      {!loaded && (
        <span
          aria-hidden
          className="absolute inset-0 animate-pulse bg-gradient-to-br from-space-panel via-space-panel2 to-space-panel"
        />
      )}
      <Image
        {...props}
        alt={alt}
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}