import { router } from "./trpc.js";
import getPage from "./procedures/get-page.js";
import { getAllResultsForLocation } from "./procedures/get-all-results-for-location.js";

export const appRouter = router({
  getPage,
  getAllResultsForLocation,
});

export type AppRouter = typeof appRouter;
