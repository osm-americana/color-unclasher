#!/usr/bin/env node

import commandLine from "./components/cli/index.js";
import adjustRGB from "./components/module/adjustRGB.js";
import adjustHSL from "./components/module/adjustHSL.js";

import { fileURLToPath } from "url";
import { dirname } from "path";
import { createRequire } from "module";
import fs from "fs";

const currentDir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const entryScript = require.resolve(process.argv[1]);

if (currentDir === dirname(entryScript)) {
  const args = require("yargs").argv;
  const exportPairsPath = args["export-pairs-path"] || null;
  const minZoom = parseInt(args["min-zoom"]) || 0;
  const maxZoom = parseInt(args["max-zoom"]) || 22;
  const parisToIgnorePath = args["pairs-to-ignore-path"] || null;
  const minDeltaE = parseFloat(args["min-deltaE"]) || 5.5;
  const getSuggest = args["get-suggest"] || false;
  const [filePath, outPutPath] = args._;

  if (minZoom > maxZoom) {
    console.error("Max zoom must be greater than or equal to min zoom");
    process.exit(1);
  }

  if (!filePath) {
    console.error("Please provide a path to the style specification");
    process.exit(1);
  }

  if (parisToIgnorePath) {
    // make sure the pairs to ignore file exists
    fs.access(parisToIgnorePath, fs.F_OK, (err) => {
      if (err) {
        console.error("Error reading pairs to ignore file:", err);
        process.exit(1);
      }
    });
  }

  // make sure the style file exists
  fs.access(filePath, fs.F_OK, (err) => {
    if (err) {
      console.error("Error reading file:", err);
      process.exit(1);
    }
  });

  commandLine(
    filePath,
    outPutPath,
    exportPairsPath,
    minZoom,
    maxZoom,
    parisToIgnorePath,
    minDeltaE,
    getSuggest
  );
}

export default {
  adjustRGB,
  adjustHSL,
};
