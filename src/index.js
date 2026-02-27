#!/usr/bin/env node

import extractStyle from "./utils/extractStyle.js";
import processStyles from "./utils/processStyles.js";
import outPutAnalysis from "./utils/outPutAnalysis.js";
import { readFile, isValidStructure } from "./utils/IO.js";

export default async function commandLine(
  filePath,
  outPutPath,
  exportPairsPath,
  minZoom,
  maxZoom,
  parisToIgnorePath,
  minDeltaE,
  getSuggest
) {
  const layerTypes = ["fill", "line"];
  const colorBlindModes = ["normal", "deuteranopia", "protanopia", "tritanopia"];

  try {
    // 1. Parallelize Initial Data Fetching
    // We fetch styles and ignore-pairs simultaneously to save time
    const [styles, nonCompliantPairsToIgnore] = await Promise.all([
      extractStyle(filePath, layerTypes),
      parisToIgnorePath ? readFile(parisToIgnorePath) : Promise.resolve(null)
    ]);

    // 2. Immediate Structure Validation
    if (nonCompliantPairsToIgnore) {
      try {
        isValidStructure(nonCompliantPairsToIgnore, colorBlindModes, layerTypes);
      } catch (err) {
        console.error("\n[Error] The ignore-pairs file format is invalid.");
        console.error("Check documentation or omit the file to proceed.");
        console.error(err.message);
        return; // Terminate early
      }
    }

    // 3. Style Processing (CPU Intensive)
    const resultArray = processStyles(
      layerTypes,
      styles,
      colorBlindModes,
      [minZoom, maxZoom],
      minDeltaE
    );

    // 4. Final Output Generation
    await outPutAnalysis(
      resultArray,
      colorBlindModes,
      outPutPath,
      exportPairsPath,
      nonCompliantPairsToIgnore,
      getSuggest,
      minDeltaE
    );

  } catch (globalErr) {
    console.error("An unexpected error occurred during analysis:", globalErr);
  }
}