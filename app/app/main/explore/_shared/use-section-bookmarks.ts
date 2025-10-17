import { citiesAtom, getCityAtom } from "@/utils/bookmarks";
import { SectionNode } from "@bcye/structured-wikivoyage-types";
import { useAtom } from "jotai/react";
import { append, assoc, dissoc } from "ramda";
import { useCallback } from "react";
import { toast } from "sonner-native";

/**
 * Shared hook for managing section bookmarks
 */
export function useSectionBookmarks(
  pageId: string,
  title: string | string[],
  section: SectionNode | undefined,
  pageTitle: string | undefined,
) {
  const [bookmarks, setBookmarks] = useAtom(getCityAtom(pageId));
  const [cities, setCities] = useAtom(citiesAtom);

  const isBookmarked = useCallback(
    function isBookmarked(id: string) {
      return !!bookmarks[id];
    },
    [bookmarks],
  );

  const toggleBookmarked = useCallback(
    function toggleBookmarked(id: string) {
      if (id == ",") {
        toast.error(
          "This listing doesn't have a location and can't be bookmarked. Add one on en.wikivoyage.org",
        );
        return;
      }

      if (isBookmarked(id)) {
        setBookmarks(dissoc(id, bookmarks));
      } else {
        if (!cities.find((c) => c.qid === pageId)) {
          setCities(append({ qid: pageId, name: pageTitle! }, cities));
        }
        setBookmarks(
          assoc(
            id,
            { section: title, properties: section!.properties },
            bookmarks,
          ),
        );
      }
    },
    [
      bookmarks,
      setBookmarks,
      section,
      isBookmarked,
      pageTitle,
      cities,
      setCities,
      pageId,
      title,
    ],
  );

  return { isBookmarked, toggleBookmarked };
}
