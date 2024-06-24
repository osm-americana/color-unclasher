import fs from "fs";

export default async function readFile(exportPairsPath) {
  const pairs = new Promise((resolve, reject) => {
    fs.readFile(exportPairsPath, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const jsonData = JSON.parse(data);

      resolve(jsonData);
    });
  }).catch((error) => {
    console.error("Error reading file:", error);
  });
  // JSON.stringify(pairs, null, 2);

  return pairs;
}
