const fs = require("fs");
const path = require("path");
const xml2js = require("xml2js");

// Define the input and output paths
const inputFilePath = process.argv[2];
const outputDirPath = process.argv[3];

// Create the output directory if it doesn't exist
if (!fs.existsSync(outputDirPath)) {
  fs.mkdirSync(outputDirPath, { recursive: true });
}

// Read and parse the XML file
fs.readFile(inputFilePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading XML file:", err);
    return;
  }
  xml2js.parseString(
    data,
    { explicitArray: false, trim: true },
    (err, result) => {
      if (err) {
        console.error("Error parsing XML:", err);
        return;
      }

      // Navigate to the list of pages
      const pages = result.mediawiki.page;
      pages.forEach((page) => {
        const id = page.id;
        const text = page.revision.text._;

        if (typeof text !== "undefined") {
          if (typeof text !== "string") {
            console.log(page.revision.text);
            throw new Error("Text is not a string");
          }

          // Sanitize filename and output the text to a file named after the page ID
          const outputPath = path.join(outputDirPath, `${id}.txt`);
          fs.writeFileSync(outputPath, text, "utf8");
        }
      });

      console.log("Wikitext files have been created successfully.");
    },
  );
});
