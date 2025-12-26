import {
  createContext,
  use,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

interface ExpandContextValue {
  expanded: boolean;
  setExpanded: Dispatch<SetStateAction<boolean>>;
}

const ExpandContext = createContext<ExpandContextValue | null>(null);

export function ExpandProvider({ children }: { children: ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <ExpandContext value={{ expanded, setExpanded }}>{children}</ExpandContext>
  );
}

export function useExpand() {
  const context = use(ExpandContext);
  if (!context) {
    throw new Error("useExpand must be used within ExpandProvider");
  }
  return context;
}
