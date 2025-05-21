import {
  useLocalSearchParams,
  useNavigation,
  usePathname,
  useRouter,
} from "expo-router";
import useCurrentId from "./use-current-id";
import { useEffect } from "react";

export default function useBackOnMapMove(finishedLoading: boolean) {
  const { pageId } = useLocalSearchParams();
  const router = useRouter();
  const id = useCurrentId();

  useEffect(() => {
    if (
      finishedLoading &&
      id !== null &&
      typeof pageId == "string" &&
      id !== pageId
    ) {
      router.dismissAll();
    }
  }, [finishedLoading, id, pageId]);
}
