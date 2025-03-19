import { geocoding } from "@maptiler/client";
import { TRPCError } from "@trpc/server";
import { RowDataPacket } from "mysql2";
import { z } from "zod";
import { publicProcedure } from "../trpc.ts";
import { Feature } from "../types/maptiler.ts";
import { getWikiItem } from "../clients/bunny.ts";
import { PageInfo } from "../types/wikivoyage.ts";

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

    console.log(latLng, bbox);

    const geocodeResult = await geocoding.reverse([latLng[1], latLng[0]], {
      types: ["country", "region", "locality", "neighbourhood", "municipality"],
    });
    let features = geocodeResult.features as Feature[];
    console.log(features);

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

    const nfos: [string | undefined, PageInfo | null][] = await Promise.all(
      wikidataIds.map(async (id) => [
        id,
        !id ? null : await getWikiItem(id, "en", "nfo"),
      ]),
    );

    const finalId = features.find(
      (f) =>
        nfos.findIndex(([id, nfo]) => id == f.properties.wikidata && !!nfo) !=
        -1,
    )?.properties.wikidata!;

    if (!finalId) throw new Error("Non found");

    const final = nfos.find(([id]) => id == finalId);
    const finalNfo = final![1]!;

    return { ...finalNfo, wikidataId: finalId };
  });

export default getPage;
