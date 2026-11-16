import "react";

declare module "react" {
  /** Interest invokers (HTML): the popover a button shows on hover or focus. */
  interface ButtonHTMLAttributes<T> {
    interestfor?: string;
  }
}
