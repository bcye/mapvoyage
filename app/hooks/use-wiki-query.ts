import { RootNode } from "@/types/nodes";
import { useQuery } from "@tanstack/react-query";

export default function useWikiQuery(id: string | undefined) {
  return useQuery({
    enabled: !!id,
    queryKey: ["wiki", id],
    queryFn: () => {
      return fetch("https://cdn.infra.mapvoyage.app/en/" + id + ".json").then(
        (r) => r.json() as Promise<RootNode>,
      );
    },
  });
}
