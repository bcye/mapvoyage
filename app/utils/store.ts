import { RegionPayload } from "@maplibre/maplibre-react-native";
import { Route } from "expo-router";
import { create } from "zustand";

export type Region = GeoJSON.Feature<GeoJSON.Point, RegionPayload>;

export enum MarkerType {
  Normal = "normal",
  Bookmark = "bookmark",
}

export type MapMarker = {
  id: string;
  link: Route;
  lat: number;
  long: number;
  /**
   * - Normal markers are exported from the relevant sections
   * - Bookmarked markers are exported from the currently viewed page and thus always visible
   */
  type: MarkerType;
};

export type Store = {
  region: Region | null;
  setRegion: (region: Region) => void;

  markers: MapMarker[];
  registerMarker: (marker: MapMarker) => void;
  deregisterMarker: (marker: MapMarker) => void;
};

export const useMapStore = create<Store>((set) => ({
  region: null,
  setRegion: (region: Region | ((region: Region | null) => Region)) =>
    set(
      typeof region == "function"
        ? (state) => ({ region: region(state.region) })
        : { region },
    ),

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
