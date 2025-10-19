import { Place } from "@/components/place-card";
import { persistentStorage } from "@/utils/jotai";
import { useAtomValue, useSetAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";
import { useEffect } from "react";
import { produce } from "immer";

/**
 * An atom storing a stack of the last 5 visited cities
 */
const lastVisitedCitiesAtom = atomWithStorage<Place[]>(
  "last-visited-cities",
  [],
  persistentStorage,
);

export function useLastVisitedCities() {
  return useAtomValue(lastVisitedCitiesAtom);
}

/**
 * implements an effect that marks the city as visited (puts it on the visited cities stack)
 * @param city will be deeply checked
 */
export function usePushCityVisit(city: Partial<Place>) {
  const setLastVisitedCities = useSetAtom(lastVisitedCitiesAtom);

  useEffect(
    function markCityVisited() {
      if (!city.id || !city.title) return;

      setLastVisitedCities(async (c) =>
        produce(await Promise.resolve(c), (cities) => {
          return [
            { id: city.id!, title: city.title! },
            ...cities.filter((c) => c.id != city.id),
          ].slice(0, 5);
        }),
      );
    },
    [city.id, city.title, setLastVisitedCities],
  );
}
