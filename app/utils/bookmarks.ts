import { ListingNode } from "@bcye/structured-wikivoyage-types";
import { atomWithStorage } from "jotai/utils";
import { WritableAtom } from "jotai/vanilla";
import { persistentStorage } from "./jotai";

export type BookmarkFeature = {
  section: string;
  properties: ListingNode;
};

const cityAtomRegistry: Record<
  string,
  WritableAtom<
    Record<string, BookmarkFeature> | Promise<Record<string, BookmarkFeature>>,
    any,
    any
  >
> = {};

export function getCityAtom(qid: string) {
  return (
    cityAtomRegistry[qid] ??
    (cityAtomRegistry[qid] = atomWithStorage<Record<string, BookmarkFeature>>(
      qid,
      {},
      persistentStorage,
    ))
  );
}

export type City = {
  qid: string;
  name: string;
};

export const citiesAtom = atomWithStorage<City[]>(
  "cities",
  [],
  persistentStorage,
);
