import {
  useLocalSearchParams,
  useNavigation,
  usePathname,
  useRouter,
} from "expo-router";
import useCurrentId from "./use-current-id";
import { useEffect } from "react";

export default function useBackOnMapMove() {
  const { pageId } = useLocalSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  console.log(pathname);
  const id = useCurrentId();

  useEffect(() => {
    if (id !== null && typeof pageId == "string" && id !== pageId) {
      router.navigate("/index");
    }
  }, [id, pageId]);
}
