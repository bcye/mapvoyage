import z from "zod";
import { publicProcedure } from "../trpc.ts";
import path from "node:path";
import { readFile } from "node:fs/promises";

const getWikitext = publicProcedure
  .input(
    z.object({
      pageId: z.number().min(0).max(300000).int(),
    }),
  )
  .query(async function getWikitext(opts) {
    const wikitext = await readFile(
      path.join(process.env.WIKITEXT_DIR!, `${opts.input.pageId}.txt`),
      "utf-8",
    );

    return wikitext;
  });

export default getWikitext;
