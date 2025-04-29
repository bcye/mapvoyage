import { geocoding } from "@maptiler/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { wikiItemExists } from "../clients/bunny.js";
import { publicProcedure } from "../trpc.js";
import { Feature } from "../types/maptiler.js";
import { PageInfo } from "../types/wikivoyage.js";

const getPage = publicProcedure
  .input(
    z.object({
      latLng: z.tuple([z.number(), z.number()]),
      bbox: z.tuple([z.number(), z.number(), z.number(), z.number()]),
    }),
  )
  .query(async function getPage(opts) {
    const err = new TRPCError({
      code: "NOT_FOUND",
      message: "No page found for your location, try zooming out",
    });

    const {
      input: { latLng, bbox },
    } = opts;

    const geocodeResult = await geocoding.reverse([latLng[1], latLng[0]], {
      types: ["country", "region", "locality", "neighbourhood", "municipality"],
    });
    let features = geocodeResult.features as Feature[];

    // select the feature whose bbox matches the input bbox the most and has a wikidata property
    features = features
      .filter((f) => f.bbox && f.properties.wikidata)
      .sort((a, b) => {
        const aDistance = Math.sqrt(
          a.bbox.reduce(
            (sum, value, index) => sum + Math.pow(value - bbox[index], 2),
            0,
          ),
        );
        const bDistance = Math.sqrt(
          b.bbox.reduce(
            (sum, value, index) => sum + Math.pow(value - bbox[index], 2),
            0,
          ),
        );

        return aDistance - bDistance;
      });

    // Extract all wikidata IDs from features
    const wikidataIds = features.map((f) => f.properties.wikidata);

    if (wikidataIds.length === 0) throw new Error("Non found");

    const exists: [string | undefined, PageInfo | null][] = await Promise.all(
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
