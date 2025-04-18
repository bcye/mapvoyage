import { RootNode } from "../types/nodes.js";
import { PageInfo } from "../types/wikivoyage.js";

const BASE_URL = "https://cdn.infra.mapvoyage.app";

export function getObject(path: string) {
  return fetch(`${BASE_URL}/${path}`);
}

export async function wikiItemExists(id: string, lang: "en") {
  const res = await fetch(`${BASE_URL}/${lang}-json/${id}.wiki.json`, {
    method: "HEAD",
  });
  if (res.ok) return true;
  if (res.status == 404) return false;

  console.error(res);
  throw new Error("Weird status");
}

export function getWikiItem(id: string, lang: "en"): Promise<RootNode | null> {
  return getObject(`${lang}-json/${id}.wiki.json`).then((r) => {
    if (r.status == 404) return null;
    else return r.json();
  });
}
