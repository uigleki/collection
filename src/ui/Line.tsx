/**
 * One line of text that slides up from behind its own overflow mask (.rise),
 * after a delay of `at` ms when one is given. Callers stagger `at` so the
 * lines follow one another.
 */
export function Line({ at, children }: { at?: number; children: string }) {
  return (
    <span className="block overflow-hidden">
      <span
        className="rise block"
        style={at === undefined ? undefined : { "--at": `${at}ms` }}
      >
        {children}
      </span>
    </span>
  );
}
