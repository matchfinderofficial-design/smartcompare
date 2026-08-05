"use client";

import Image, { type ImageProps } from "next/image";
import { useEffect, useMemo, useState } from "react";

const ALLOWED_HOSTNAMES = new Set([
  "www.meaco.com",
  "meaco.com",
  "probreeze.com",
  "www.probreeze.com",
]);

type ProductImageProps = Omit<ImageProps, "src"> & {
  src?: string | null;
};

export default function ProductImage({
  src,
  alt,
  className,
  sizes,
  ...rest
}: ProductImageProps) {
  const [hasError, setHasError] = useState(false);

  const safeSrc = useMemo(() => {
    if (!src) return null;

    try {
      const url = new URL(src);

      if (!ALLOWED_HOSTNAMES.has(url.hostname)) {
        return null;
      }

      // Manufacturer pages sometimes return HTTP image URLs.
      // Upgrade them to HTTPS before passing them to Next Image.
      if (url.protocol === "http:") {
        url.protocol = "https:";
      }

      if (url.protocol !== "https:") {
        return null;
      }

      return url.toString();
    } catch {
      return null;
    }
  }, [src]);

  // Reset the error state when the image URL changes.
  useEffect(() => {
    setHasError(false);
  }, [safeSrc]);

  if (!safeSrc || hasError) {
    return (
      <div
        className={`flex h-full w-full items-center justify-center bg-slate-100 text-center text-sm font-medium text-slate-500 ${
          className ?? ""
        }`}
      >
        <span>Product image unavailable</span>
      </div>
    );
  }

  return (
    <Image
      src={safeSrc}
      alt={alt || "Product image"}
      sizes={sizes}
      fill
      className={`object-contain ${className ?? ""}`}
      onError={() => setHasError(true)}
      {...rest}
    />
  );
}
