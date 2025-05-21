import { createContext, useContext } from "react";

export const CameraRefContext = createContext<
  (lng: number, lat: number, zoom?: number) => void
>(() => {
  // noop
});

export default function useMoveTo() {
  return useContext(CameraRefContext);
}
