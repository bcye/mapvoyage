import { createContext, useContext } from "react";

export const CameraRefContext = createContext<
  (lng: number, lat: number, zoom: number) => void
>(() => {
  // noop
  console.log("noop, inside defaultValue");
});

export default function useMoveTo() {
  return useContext(CameraRefContext);
}
