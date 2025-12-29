import { Component, type ReactNode } from "react";
import { Link } from "react-router";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  override render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-dvh flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-4xl text-foreground mb-4">
            Something went wrong
          </h1>
          <p className="text-muted-foreground mb-8">
            An unexpected error occurred.
          </p>
          <Link
            to="/"
            onClick={() => this.setState({ hasError: false })}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            ← Return home
          </Link>
        </main>
      );
    }

    return this.props.children;
  }
}
