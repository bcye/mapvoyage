import { geocoding, GeocodingPlaceType } from "@maptiler/client";
import { publicProcedure } from "../trpc.js";
import { z } from "zod";
import { Feature } from "../types/maptiler.js";
import { wikiItemExists } from "../clients/bunny.js";

const getAllResultsForLocation = publicProcedure
  .input(
    z.object({
      lngLat: z.tuple([z.number(), z.number()]),
    }),
  )
  .query(async function getAllResultsForLocation(opts) {
    const {
      input: { lngLat },
    } = opts;

    const placeTypes: GeocodingPlaceType[] = [
      "country",
      "region",
      "subregion",
      "county",
      "joint_municipality",
      "joint_submunicipality",
      "municipality",
      "municipal_district",
      "locality",
      "neighbourhood",
      "place",
    ];

    const geocodeResult = await geocoding.reverse([lngLat[0], lngLat[1]], {
      types: placeTypes,
    });

    let features = geocodeResult.features as Feature[];
    // select the feature whose bbox matches the input bbox the most and has a wikidata property
    features = features.filter((f) => f.bbox && f.properties.wikidata);

    // sort features descending by the highest place type index (simpler: use indexOf directly)
    features.sort((a, b) => {
      const aMax = a.place_type.length
        ? Math.max(...a.place_type.map((t) => placeTypes.indexOf(t)))
        : -1;
      const bMax = b.place_type.length
        ? Math.max(...b.place_type.map((t) => placeTypes.indexOf(t)))
        : -1;
      return bMax - aMax;
    });

    let wikidataIds = features.map((f) => f.properties.wikidata);
    const exists: boolean[] = await Promise.all(
      wikidataIds.map(async (id) =>
        !id ? false : await wikiItemExists(id, "en"),
      ),
    );

    wikidataIds = wikidataIds.filter((_, idx) => exists[idx]);

    return wikidataIds;
  });
