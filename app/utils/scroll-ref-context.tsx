import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useRef,
} from "react";
import { ScrollView } from "react-native";

const ScrollRefContext =
  createContext<MutableRefObject<ScrollView | null> | null>(null);

const Provider = ScrollRefContext.Provider;

export function ScrollRefProvider({ children }: { children: ReactNode }) {
  const scrollRef = useRef<ScrollView | null>(null);

  return <Provider value={scrollRef}>{children}</Provider>;
}

export const useScrollRef = () => useContext(ScrollRefContext);
