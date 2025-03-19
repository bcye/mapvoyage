import https from "https";
import { createGunzip } from "zlib";
import bz2 from "unbzip2-stream";
import sax from "sax";
import wtf from "wtf_wikipedia";

// Bunny Storage configuration
const BUNNY_REGION = "storage";
const BUNNY_STORAGE_ZONE = "wikivoyage";
const BUNNY_API_KEY = process.env.BUNNY_KEY;
const UPLOAD_PREFIX = "en";

// --- Step 1: Fetch mappings from SQL dump ---

async function fetchMappings(): Promise<Record<string, string>> {
  return new Promise((resolve, reject) => {
    const sqlUrl =
      "https://dumps.wikimedia.org/enwikivoyage/latest/enwikivoyage-latest-page_props.sql.gz";
    https
      .get(sqlUrl, (res) => {
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Failed to get SQL dump, status code: ${res.statusCode}`),
          );
        }
        const gunzip = createGunzip();
        let buffer = "";
        const mappings: Record<string, string> = {};
        res.pipe(gunzip);
        gunzip.on("data", (chunk: Buffer) => {
          buffer += chunk.toString();
          const regex = /\((\d+),'([^']+)','([^']+)',(NULL|[\d\.]+)\)/g;
          let match: RegExpExecArray | null;
          while ((match = regex.exec(buffer)) !== null) {
            const [, pp_page, pp_propname, pp_value] = match;
            if (pp_propname === "wikibase_item") {
              mappings[pp_page] = pp_value;
            }
          }
          // Keep a tail to handle chunk splits
          if (buffer.length > 1000) {
            buffer = buffer.slice(-1000);
          }
        });
        gunzip.on("end", () => resolve(mappings));
        gunzip.on("error", reject);
      })
      .on("error", reject);
  });
}

// --- Step 2: Bunny Storage upload helper ---
let uploadCount = 0;

function uploadFile(filename: string, data: Buffer | string): Promise<void> {
  return new Promise((resolve, reject) => {
    const options = {
      method: "PUT",
      headers: {
        AccessKey: BUNNY_API_KEY,
        "Content-Type": "application/octet-stream",
        accept: "application/json",
      },
    };
    const url = `https://${BUNNY_REGION}.bunnycdn.com/${BUNNY_STORAGE_ZONE}/${filename}`;
    const req = https.request(url, options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        if (res.statusCode && res.statusCode < 300) {
          console.log("Upload succeeded, uploaded files:", ++uploadCount);
          resolve();
        } else {
          reject(new Error(`Upload failed (${res.statusCode}): ${body}`));
        }
      });
    });
    req.on("error", reject);
    req.write(data);
    req.end();
  });
}

// Simple semaphore to limit concurrency
class Semaphore {
  private tasks: (() => void)[] = [];
  private count: number;
  constructor(count: number) {
    this.count = count;
  }
  async acquire(): Promise<() => void> {
    return new Promise((release) => {
      const task = () => {
        this.count--;
        release(() => {
          this.count++;
          if (this.tasks.length > 0) {
            const next = this.tasks.shift()!;
            next();
          }
        });
      };
      if (this.count > 0) {
        task();
      } else {
        this.tasks.push(task);
      }
    });
  }
}

const semaphore = new Semaphore(100);

// --- Step 3: processing wikitext using wtf_wikipedia ---
function parseWikitext(wikitext: string, pageId: string): any {
  const doc = wtf(wikitext);
  // Replace this with your actual wtf_wikipedia-based logic
  return {
    pageId: pageId ?? null,
    title: doc.title() ?? null,
    sections:
      doc
        .sections()
        .filter((s) => s.depth() === 0 && s.title() != "")
        .map((s) => s.title()) ?? null,
    description: doc.paragraph(0)?.text() ?? null,
  };
}

// --- Step 4: Process the XML dump ---
async function processXML(mappings: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const xmlUrl =
      "https://dumps.wikimedia.org/enwikivoyage/latest/enwikivoyage-latest-pages-articles.xml.bz2";
    https
      .get(xmlUrl, (res) => {
        if (res.statusCode !== 200) {
          return reject(
            new Error(`Failed to fetch XML dump: ${res.statusCode}`),
          );
        }
        // Pipe through bz2 decompressor
        const stream = res.pipe(bz2());
        // Use sax for streaming XML parsing
        const parser = sax.createStream(true, {});

        let currentPageId: string | null = null;
        let currentText: string | null = null;
        let inPage = false;
        let inRevision = false;
        let inText = false;
        let currentTag: string | null = null; // Track current tag

        parser.on("opentag", (node) => {
          currentTag = node.name; // Track current tag

          if (node.name === "page") {
            inPage = true;
            currentPageId = null;
            currentText = null;
          } else if (node.name === "revision") {
            inRevision = true;
          } else if (inRevision && node.name === "text") {
            inText = true;
          }
        });

        parser.on("closetag", (tagName) => {
          if (tagName === "page") {
            if (
              typeof currentPageId == "string" &&
              currentText !== null &&
              !!mappings[currentPageId]
            ) {
              const wikidataId = mappings[currentPageId];
              const jsonData = parseWikitext(
                currentText?.toString() ?? "",
                currentPageId,
              );
              const wikiFilename = `${UPLOAD_PREFIX}/${wikidataId}.wiki.txt`;
              const jsonFilename = `${UPLOAD_PREFIX}/${wikidataId}.nfo.json`;

              // lets make copies as the values will continue changing
              const uploadText = currentText.toString();
              const uploadJSON = JSON.stringify(jsonData);

              // Schedule uploads with concurrency limiting
              Promise.all([
                semaphore
                  .acquire()
                  .then((release) =>
                    uploadFile(wikiFilename, uploadText).finally(release),
                  ),
                semaphore
                  .acquire()
                  .then((release) =>
                    uploadFile(jsonFilename, uploadJSON).finally(release),
                  ),
              ]).catch((err) =>
                console.error(`Upload error for page ${currentPageId}:`, err),
              );
            }

            // Reset state for the next page
            inPage = false;
            currentPageId = null;
            currentText = null;
          } else if (tagName === "revision") {
            inRevision = false;
          } else if (tagName === "text") {
            inText = false;
          }
          currentTag = null; // Reset current tag
        });

        parser.on("text", (text) => {
          const trimmedText = text.trim();

          if (!trimmedText) return;

          if (currentTag === "id" && inPage && !inRevision && !currentPageId) {
            currentPageId = trimmedText;
          } else if (inText) {
            currentText = (currentText || "") + trimmedText;
          }
        });

        parser.on("error", reject);
        parser.on("end", resolve);

        stream.pipe(parser);
      })
      .on("error", reject);
  });
}

// --- Main integration ---
async function main() {
  try {
    console.log("Fetching mappings from SQL dump...");
    const mappings = await fetchMappings();
    console.log(`Fetched ${Object.keys(mappings).length} mappings.`);
    console.log("Processing XML dump...");
    await processXML(mappings);
    console.log("Processing complete.");
  } catch (err) {
    console.error("Error:", err);
  }
}

main().then(() => process.exit());
