import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

export const persistentStorage = createJSONStorage<any>(() => AsyncStorage);

export const hideNearYouAtom = atomWithStorage(
  "hide-near-you",
  false,
  persistentStorage,
);
