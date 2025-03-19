import getPage from "./procedures/get-page.ts";
import getWikitext from "./procedures/get-wikitext.ts";
import { router } from "./trpc.ts";
import * as maptiler from "@maptiler/client";
import { createHTTPServer } from "@trpc/server/adapters/standalone";

maptiler.config.apiKey = process.env.MAPTILER_API_KEY!;

const appRouter = router({
  getPage,
  getWikitext,
});

// Export type router type signature,
// NOT the router itself. -> otherwise server code might be visible from client bundle
export type AppRouter = typeof appRouter;

const server = createHTTPServer({
  router: appRouter,
});

const PORT = process.env.PORT ?? 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT}`);
