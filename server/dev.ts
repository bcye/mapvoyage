import { appRouter } from "./router.ts";
import { createHTTPServer } from "@trpc/server/adapters/standalone";
import process from "node:process";

// Export type router type signature,
// NOT the router itself. -> otherwise server code might be visible from client bundle

const server = createHTTPServer({
  router: appRouter,
});

const PORT = process.env.PORT ?? 3000;

server.listen(PORT);
console.log(`Listening on port ${PORT}`);
