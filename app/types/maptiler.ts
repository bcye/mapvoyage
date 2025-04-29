export interface Feature {
  properties: {
    wikidata?: string;
  };
  bbox: Bbox;
  place_name: string;
}

export type Bbox = [number, number, number, number];
