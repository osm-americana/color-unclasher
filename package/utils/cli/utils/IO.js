import fs from "fs";
import path from "path";

export async function readFile(exportPairsPath) {
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

  return pairs;
}

export async function writeFile(outputMessages, outputPath, message) {
  fs.writeFile(path.resolve(outputPath), outputMessages, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing to output file:", writeErr);
      process.exit(1);
    }
    console.log(message, outputPath);
  });
}
