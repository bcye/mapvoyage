// @ts-nocheck will have to make this a proper type sometime

import { Feature, Point } from "geojson";
import { RegionPayload } from "@rnmapbox/maps/lib/typescript/src/components/MapView";

export type Region = Feature<Point, RegionPayload>;
