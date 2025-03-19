import * as maptiler from "@maptiler/client";
import { router } from "./trpc.js";
import getPage from "./procedures/get-page.js";
import process from "node:process";

maptiler.config.apiKey = process.env.MAPTILER_API_KEY!;

export const appRouter = router({
  getPage,
});

export type AppRouter = typeof appRouter;
