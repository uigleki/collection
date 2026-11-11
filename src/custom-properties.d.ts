import "react";

declare module "react" {
  /** A style object may set CSS custom properties. */
  interface CSSProperties {
    [property: `--${string}`]: string;
  }
}
