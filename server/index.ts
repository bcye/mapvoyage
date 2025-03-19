import * as BunnySDK from "https://esm.sh/@bunny.net/edgescript-sdk@0.10.0";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.ts";

BunnySDK.net.http.serve((req) => {
  return fetchRequestHandler({
    endpoint: "/",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
});
