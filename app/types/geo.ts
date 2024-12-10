import { Feature, Point } from "geojson";
import { RegionPayload } from "@rnmapbox/maps/lib/typescript/src/components/MapView";

export type Region = Feature<Point, RegionPayload>;
