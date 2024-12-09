import { publicProcedure, router } from "./trpc";
import { z } from "zod";

const appRouter = router({
  getPage: publicProcedure
    .input(z.tuple([z.number(), z.number()]))
    .query(async function getPage(opts) {
      const { input: latLng } = opts;
    }),
});

// Export type router type signature,
// NOT the router itself. -> otherwise server code might be visible from client bundle
export type AppRouter = typeof appRouter;
