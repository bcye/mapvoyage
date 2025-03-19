import { router } from "./trpc.js";
import getPage from "./procedures/get-page.js";

export const appRouter = router({
  getPage,
});

export type AppRouter = typeof appRouter;
