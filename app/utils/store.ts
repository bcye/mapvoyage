import { MapState } from "@rnmapbox/maps";
import { create } from "zustand";

export type Region = MapState["properties"];

export type Store = {
  region: Region | null;
  setRegion: (region: Region) => void;
};

export const useMapStore = create<Store>((set) => ({
  region: null,
  setRegion: (region: Region) => set({ region }),
}));
