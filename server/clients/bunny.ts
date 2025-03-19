import { PageInfo } from "../types/wikivoyage.js";

const BASE_URL = "https://mapvoyage.b-cdn.net";

export function getObject(path: string) {
  return fetch(`${BASE_URL}/${path}`);
}

export function getWikiItem<DataType extends "nfo" | "wikitext">(
  id: string,
  lang: "en",
  type: DataType,
): Promise<(DataType extends "nfo" ? PageInfo : string) | null> {
  return getObject(
    `${lang}/${id}.${type == "nfo" ? "nfo.json" : "wiki.txt"}`,
  ).then((r) => {
    if (r.status == 404) return null;
    else return type == "nfo" ? r.json() : r.text();
  });
}
