import AsyncStorage from "@react-native-async-storage/async-storage";
import { atomWithStorage, createJSONStorage } from "jotai/utils";

const storage = createJSONStorage(() => AsyncStorage);

type Feature = {
    section: string;
    bookmark: 
}

const cityAtomRegistry = {};

function getCityAtom(qid: string) {
  return (
    cityAtomRegistry[qid] ??
    (cityAtomRegistry[qid] = atomWithStorage(qid, [], storage))
  );
}
