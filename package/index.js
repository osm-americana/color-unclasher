#!/usr/bin/env node

import commandLine from "./utils/cli/index.js";
import adjustRGB from "./utils/module/adjustRGB.js";
import adjustHSL from "./utils/module/adjustHSL.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import fs from "fs";

const currentDir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const entryScript = require.resolve(process.argv[1]);

if (currentDir === dirname(entryScript)) {
  const [filePath, outPutPath] = process.argv.slice(2);

  if (!filePath) {
    console.error("Please provide a path to the JSON file");
    process.exit(1);
  }

  // make sure the file exists
  fs.access(filePath, fs.F_OK, (err) => {
    if (err) {
      console.error("Error reading file:", err);
      process.exit(1);
    }

    commandLine(filePath, outPutPath);
  });
}

export default {
  adjustRGB,
  adjustHSL,
};
