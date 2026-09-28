import type { ReactNode, RefObject } from "react";

/**
 * A page with nothing on it — no work here, or the night broke while it was
 * being drawn. One centered line, one explanation, one way back.
 */
export function Standstill({
  h1,
  title,
  message,
  children,
}: {
  h1?: RefObject<HTMLHeadingElement | null>;
  title: string;
  message: string;
  children: ReactNode;
}) {
  return (
    <main
      id="main"
      className="relative flex min-h-dvh flex-col items-center justify-center px-5 text-center"
    >
      <h1
        ref={h1}
        tabIndex={-1}
        className="text-title font-light tracking-tight"
      >
        {title}
      </h1>
      <p className="mt-4 text-body text-hoshi">{message}</p>
      {children}
    </main>
  );
}
