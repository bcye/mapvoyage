import { GeocodingPlaceType } from "@maptiler/client";

export interface Feature {
  properties: {
    wikidata?: string;
  };
  bbox: Bbox;
  place_name: string;
  place_type: GeocodingPlaceType[];
}

export type Bbox = [number, number, number, number];
