import { geocoding } from "@maptiler/client";
import type { GeocodingPlaceType } from "@maptiler/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { wikiItemExists } from "../clients/bunny.js";
import { publicProcedure } from "../trpc.js";
import { Feature } from "../types/maptiler.js";
import { PageInfo } from "../types/wikivoyage.js";

const getPage = publicProcedure
  .input(
    z.object({
      center: z.tuple([z.number(), z.number()]),
      zoomLevel: z.number(),
    }),
  )
  .query(async function getPage(opts) {
    const err = new TRPCError({
      code: "NOT_FOUND",
      message: "No page found for your location, try zooming out",
    });

    const {
      input: { center, zoomLevel },
    } = opts;

    // Truncate center to 3 decimals (111m precision) and zoomLevel to integer
    const truncatedCenter: [number, number] = [
      Math.round(center[0] * 1000) / 1000,
      Math.round(center[1] * 1000) / 1000,
    ];
    const truncatedZoomLevel = Math.round(zoomLevel);

    // Map zoom level to administrative types (heuristic)
    // Higher zoom = more local/specific areas, lower zoom = broader areas
    const getAdministrativeTypes = (zoom: number): GeocodingPlaceType[] => {
      if (zoom >= 13) {
        // Very local - neighborhoods, localities
        return ["neighbourhood", "locality", "place"];
      } else if (zoom >= 11) {
        // Local - municipalities, districts
        return [
          "municipality",
          "municipal_district",
          "locality",
          "neighbourhood",
          "place",
        ];
      } else if (zoom >= 9) {
        // Regional - counties, municipalities
        return [
          "county",
          "joint_municipality",
          "joint_submunicipality",
          "municipality",
          "municipal_district",
        ];
      } else if (zoom >= 7) {
        // Sub-regional
        return [
          "subregion",
          "county",
          "joint_municipality",
          "joint_submunicipality",
        ];
      } else if (zoom >= 5) {
        // Regional
        return ["region", "subregion", "county"];
      } else {
        // Country level
        return ["country", "region"];
      }
    };

    const adminTypes = getAdministrativeTypes(truncatedZoomLevel);

    const geocodeResult = await geocoding.reverse(
      [truncatedCenter[1], truncatedCenter[0]],
      {
        types: adminTypes,
      },
    );
    let features = geocodeResult.features as Feature[];

    // Filter features that have wikidata property and sort by relevance (geocoding confidence)
    features = features
      .filter((f) => f.properties.wikidata)
      .sort((a, b) => {
        // Features are already sorted by relevance from the geocoding API
        // We can also consider place_type hierarchy if needed
        return 0; // Keep original order from geocoding API
      });

    // Extract all wikidata IDs from features
    const wikidataIds = features.map((f) => f.properties.wikidata);

    if (wikidataIds.length === 0) throw new Error("Non found");

    const exists: [string | undefined, boolean][] = await Promise.all(
      wikidataIds.map(async (id) => [
        id,
        !id ? false : await wikiItemExists(id, "en"),
      ]),
    );

    const finalId = features.find(
      (f) =>
        exists.findIndex(
          ([id, exists]) => id == f.properties.wikidata && !!exists,
        ) != -1,
    )?.properties.wikidata!;

    if (!finalId) throw new Error("Non found");

    return finalId;
  });

export default getPage;
