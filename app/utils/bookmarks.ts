import { ListingNode } from "@bcye/structured-wikivoyage-types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { WritableAtom } from "jotai/vanilla";


export type BookmarkFeature = {
  section: string;
  id: string;
  properties: ListingNode;
};

const storage = createJSONStorage<any>(() => AsyncStorage);
  
const cityAtomRegistry: Record<string, WritableAtom<BookmarkFeature[] | Promise<BookmarkFeature[]>, any, any>> = {};

export function getCityAtom(qid: string) {
  return cityAtomRegistry[qid] ?? (cityAtomRegistry[qid] = atomWithStorage<BookmarkFeature[]>(qid, [], storage));
}

export type City = {
  qid: string;
  name: string;
}

export const citiesAtom = atomWithStorage<City[]>(
  "cities",
  [],
  storage
);
