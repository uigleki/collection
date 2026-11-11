import type { ReactNode, RefObject } from "react";

/**
 * Layout for the not-found page and the render-error page: a centered
 * heading, one line of explanation, and a link back (the children).
 */
export function MessagePage({
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
      <p className="mt-4 text-body text-muted">{message}</p>
      {children}
    </main>
  );
}
