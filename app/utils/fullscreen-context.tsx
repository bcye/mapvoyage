import { createContext, ReactNode, useContext } from "react";

const FullScreenContext = createContext(false);

export function FullScreenProvider({
  fullscreen,
  children,
}: {
  fullscreen: boolean;
  children: ReactNode;
}) {
  return (
    <FullScreenContext.Provider value={fullscreen}>
      {children}
    </FullScreenContext.Provider>
  );
}

export const useIsFullscreen = () => useContext(FullScreenContext);
