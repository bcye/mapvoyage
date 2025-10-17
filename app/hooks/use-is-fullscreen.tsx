import { createContext, ReactNode, useContext } from "react";

type FullScreenContextValue = {
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
};

const FullScreenContext = createContext<FullScreenContextValue>({
  fullscreen: false,
  setFullscreen: () => {},
});

export function FullScreenProvider({
  fullscreen,
  setFullscreen,
  children,
}: {
  fullscreen: boolean;
  setFullscreen: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <FullScreenContext.Provider value={{ fullscreen, setFullscreen }}>
      {children}
    </FullScreenContext.Provider>
  );
}

export const useIsFullscreen = () => useContext(FullScreenContext).fullscreen;
export const useSetFullscreen = () =>
  useContext(FullScreenContext).setFullscreen;
