import type { ComponentProps, CSSProperties } from "react";
import { responsiveImage } from "../../lib/responsive-images";

type Props = Omit<ComponentProps<"img">, "src"> & { src?: string; fill?: boolean; priority?: boolean; deferred?: boolean; preserveAlpha?: boolean };

/** Keep styling, event handlers and animation refs on the actual image. The
 * picture has no layout box, so flex/grid/absolute image ownership is retained. */
export default function ResponsiveImage({ src, srcSet, sizes, fill, priority, deferred = false, preserveAlpha = false,
  loading, decoding = "async", fetchPriority, style, alt = "", ...props }: Props) {
  const image = responsiveImage(src, preserveAlpha);
  const resolvedSizes = sizes ?? (props.width ? `${props.width}px` : "100vw");
  const imageStyle: CSSProperties | undefined = fill
    ? { position: "absolute", height: "100%", width: "100%", inset: 0, color: "transparent", ...style }
    : style;
  const attributes = {
    ...props, alt, sizes: image ? resolvedSizes : sizes, style: imageStyle,
    loading: priority ? "eager" as const : loading ?? "lazy" as const,
    fetchPriority: priority ? "high" as const : fetchPriority, decoding,
    src: deferred ? undefined : image?.src ?? src,
    srcSet: deferred ? undefined : image?.webp ?? srcSet,
    "data-src": deferred ? image?.src ?? src : undefined,
    "data-srcset": deferred ? image?.webp ?? srcSet : undefined,
  };
  // A plain image is intentional for unsupported/signed/SVG/animated sources.
  // eslint-disable-next-line @next/next/no-img-element
  const element = <img {...attributes} alt={alt} />;
  if (!image) return element;
  return <picture style={{ display: "contents" }}>
    <source type="image/avif" sizes={resolvedSizes} srcSet={deferred ? undefined : image.avif} data-srcset={deferred ? image.avif : undefined} />
    <source type="image/webp" sizes={resolvedSizes} srcSet={deferred ? undefined : image.webp} data-srcset={deferred ? image.webp : undefined} />
    {element}
  </picture>;
}
