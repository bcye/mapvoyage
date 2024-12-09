import { z } from "zod";
import { publicProcedure } from "../trpc";
import { geocoding } from "@maptiler/client";
import { Feature } from "../types/maptiler";
import { TRPCError } from "@trpc/server";
import db from "../clients/db";
import { readFile } from "fs/promises";
import { RowDataPacket } from "mysql2";
import path from "path";
import wtf from "wtf_wikipedia";

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

    const geocodeResult = await geocoding.reverse(latLng, {
      types: ["country", "region", "locality", "neighbourhood", "municipality"],
    });
    const features = geocodeResult.features as Feature[];

    // select the feature whose bbox matches the input bbox the most and has a wikidata property
    const feature = features
      .filter((feature) => feature.properties.wikidata)
      .sort((a, b) => {
        const aArea = (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]);
        const bArea = (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]);
        return Math.abs(aArea - bArea);
      })[0];

    if (!feature) throw err;

    const query = await db.prepare(
      `SELECT p.page_id as wikidata_id
       FROM page p
       JOIN page_props pp ON p.page_id = pp.pp_page
       WHERE pp.pp_propname = 'wikibase_item'
       AND pp.pp_value = ? LIMIT 1`,
    );
    const [rows] = (await query.execute([feature.properties.wikidata])) as [
      RowDataPacket[],
      any,
    ];
    await query.close();

    // if it includes secondary info, remove it (e.g. "city, country" -> "city")
    const title = feature.place_name.split(",")[0];

    if (!rows[0]) throw err;

    const wikitext = await readFile(
      path.join(process.env.WIKITEXT_DIR!, `${rows[0].wikidata_id}.txt`),
      "utf-8",
    );

    return { title, wikitext };
  });

export default getPage;
