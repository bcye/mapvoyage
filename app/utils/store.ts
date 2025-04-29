import { RegionPayload } from "@maplibre/maplibre-react-native";
import { MutableRefObject, Ref } from "react";
import { ScrollView } from "react-native";
import { create } from "zustand";

export type Region = GeoJSON.Feature<GeoJSON.Point, RegionPayload>;

export type MapMarker = { id: string; link: string; lat: number; long: number };

export type Store = {
  region: Region | null;
  setRegion: (region: Region) => void;

  markers: MapMarker[];
  registerMarker: (marker: MapMarker) => void;
  deregisterMarker: (marker: MapMarker) => void;
};

export const useMapStore = create<Store>((set) => ({
  region: null,
  setRegion: (region: Region) => set({ region }),

  markers: [],
  registerMarker(marker) {
    set((s) => ({
      ...s,
      markers: [...s.markers, marker],
    }));
  },
  deregisterMarker(marker) {
    set((s) => ({
      ...s,
      markers: s.markers.toSpliced(
        s.markers.findIndex((m) => m.id == marker.id),
        1,
      ),
    }));
  },
}));
