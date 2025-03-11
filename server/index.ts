import * as maptiler from "@maptiler/client";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import getPage from "./procedures/get-page";
import getWikitext from "./procedures/get-wikitext";
import { router } from "./trpc";
import { Env } from "./types/env";

const appRouter = router({
  getPage,
  getWikitext,
});

// Export type router type signature for the client to consume,
// NOT the router itself. -> otherwise server code might be visible from client bundle
export type AppRouter = typeof appRouter;

/**
 * See the following docs on how to use and set secrets and envs.
 * Notably secrets are accessed the same as env vars.
 *
 * - https://developers.cloudflare.com/workers/configuration/environment-variables/
 * - https://developers.cloudflare.com/workers/configuration/secrets/
 */

export default {
  async fetch(request, env, ctx): Promise<Response> {
    maptiler.config.apiKey = env.MAPTILER_API_KEY!;

    return fetchRequestHandler({
      endpoint: "/",
      req: request,
      router: appRouter,
      /**
       * we expose the cloudflare environment using trpc ctx
       * see: https://trpc.io/docs/server/context
       */
      async createContext(opts) {
        return { env };
      },
    });
  },
} satisfies ExportedHandler<Env>;
