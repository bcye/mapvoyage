import { geocoding } from "@maptiler/client";
import { TRPCError } from "@trpc/server";
import { RowDataPacket } from "mysql2";
import { z } from "zod";
import connection from "../clients/db";
import { publicProcedure } from "../trpc";
import { Feature } from "../types/maptiler";

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

    const db = await connection;
    // Extract all wikidata IDs from features
    const wikidataIds = features.map((f) => f.properties.wikidata);

    if (wikidataIds.length === 0) throw new Error("Non found");

    console.log(features.map((f) => [f.place_name, f.properties.wikidata]));

    // Query all pages whose wikibase_item matches any of the features' wikidata props
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT p.page_id as page_id, pp.pp_value as wikidata_id
       FROM page p
       JOIN page_props pp ON p.page_id = pp.pp_page
       WHERE pp.pp_propname = 'wikibase_item'
       AND pp.pp_value IN (?)`,
      [wikidataIds],
    );

    console.log("rows", rows);

    const feature = features.find(
      (f) =>
        rows.findIndex((r) => r.wikidata_id == f.properties.wikidata) != -1,
    );

    if (!feature) throw new Error("Non found");

    // if it includes secondary info, remove it (e.g. "city, country" -> "city")
    const title = feature.place_name.split(",")[0];

    const pageId: string = rows.find(
      (r) => r.wikidata_id == feature.properties.wikidata,
    )!.page_id;

    console.log("page", pageId, title);

    return { title, pageId };
  });

export default getPage;
