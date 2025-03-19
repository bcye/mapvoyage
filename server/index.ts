import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";
import * as maptiler from "@maptiler/client";

BunnySDK.net.http.serve((req) => {
  maptiler.config.apiKey = process.env.MAPTILER_API_KEY!;

  return fetchRequestHandler({
    endpoint: "/",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
});
