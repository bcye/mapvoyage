import { geocoding } from "@maptiler/client";
import { TRPCError } from "@trpc/server";
import { readFile } from "fs/promises";
import { RowDataPacket } from "mysql2";
import path from "path";
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
    const features = geocodeResult.features as Feature[];
    console.log(
      latLng,
      bbox,
      features.map((f) => f.place_name),
    );

    // select the feature whose bbox matches the input bbox the most and has a wikidata property
    const feature = features
      .filter((f) => f.bbox)
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
      })[0];

    if (!feature) throw err;

    const db = await connection;
    const [rows] = await db.execute<RowDataPacket[]>(
      `SELECT p.page_id as wikidata_id
       FROM page p
       JOIN page_props pp ON p.page_id = pp.pp_page
       WHERE pp.pp_propname = 'wikibase_item'
       AND pp.pp_value = ? LIMIT 1`,
      [feature.properties.wikidata],
    );

    // if it includes secondary info, remove it (e.g. "city, country" -> "city")
    const title = feature.place_name.split(",")[0];

    if (!rows[0]) throw err;

    const pageId: string = rows[0].wikidata_id;

    return { title, pageId };
  });

export default getPage;
