export function Footer() {
  return (
    <footer className="mt-24 pb-12 text-center space-y-4">
      <p className="text-muted-foreground text-sm italic">
        I honor the creators who refuse shortcuts.
      </p>
      <div className="flex items-center justify-center gap-4 text-muted-foreground text-sm">
        <a
          href="https://github.com/uigleki/collection"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          GitHub
        </a>
        <span>·</span>
        <a
          href="https://creativecommons.org/licenses/by-sa/4.0/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          CC BY-SA 4.0
        </a>
      </div>
    </footer>
  );
}
