import BottomSheet from "@gorhom/bottom-sheet";
import {
  createContext,
  MutableRefObject,
  ReactNode,
  useContext,
  useRef,
} from "react";
import { ScrollView } from "react-native";

const ScrollRefContext = createContext<{
  scrollRef: MutableRefObject<ScrollView | null> | null;
  bottomSheetRef: MutableRefObject<BottomSheet | null> | null;
}>({ scrollRef: null, bottomSheetRef: null });

const Provider = ScrollRefContext.Provider;

export function ScrollRefProvider({ children }: { children: ReactNode }) {
  const scrollRef = useRef<ScrollView | null>(null);
  const bottomSheetRef = useRef<BottomSheet | null>(null);

  return <Provider value={{ scrollRef, bottomSheetRef }}>{children}</Provider>;
}

export const useScrollRef = () => useContext(ScrollRefContext).scrollRef;
export const useBottomSheetRef = () =>
  useContext(ScrollRefContext).bottomSheetRef;
