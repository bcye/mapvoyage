import { RegionPayload } from "@maplibre/maplibre-react-native";
import { create } from "zustand";

export type Region = GeoJSON.Feature<GeoJSON.Point, RegionPayload>;

export type Store = {
  region: Region | null;
  setRegion: (region: Region) => void;
};

export const useMapStore = create<Store>((set) => ({
  region: null,
  setRegion: (region: Region) => set({ region }),
}));
