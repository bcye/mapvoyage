import { appRouter } from "./router.js";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import process from "node:process";
import * as maptiler from "@maptiler/client";

// Export type router type signature,
// NOT the router itself. -> otherwise server code might be visible from client bundle
maptiler.config.apiKey = process.env.MAPTILER_API_KEY!;

const server = createHTTPServer({
  router: appRouter,
});

const PORT = process.env.PORT ?? 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT}`);
