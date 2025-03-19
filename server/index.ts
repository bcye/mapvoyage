import * as BunnySDK from "@bunny.net/edgescript-sdk";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router.js";

BunnySDK.net.http.serve((req) => {
  return fetchRequestHandler({
    endpoint: "/",
    req,
    router: appRouter,
    createContext: () => ({}),
  });
});
