import getOptions from "./utils/getOptions.js";
import extractStyle from "./utils/extractStyle.js";
import processStyles from "./utils/processStyles.js";
import outPutAnalysis from "./utils/outPutAnalysis.js";
import readFile from "./utils/IO.js";

import fs from "fs";

export default async function commandLine(filePath, outPutPath, exportPairsPath) {
  const options = await getOptions();

  if (options.ignorePairsFile) {
    // make sure the non-compliant pairs file exists
    fs.access(options.ignorePairsFile, fs.F_OK, (err) => {
      if (err) {
        console.error("Error reading non-compliant pairs file:", err);
        process.exit(1);
      }
    });
  }

  const layerTypes = ["fill", "line"];
  const colorBlindTypes = [
    "normal",
    "deuteranopia",
    "protanopia",
    "tritanopia",
  ];

  const styles = await extractStyle(filePath, layerTypes);
  const resultArray = processStyles(
    layerTypes,
    styles,
    colorBlindTypes,
    options.minMaxZoom,
    options.targetDeltaE
  );

  let nonCompliantPairsToIgnore = null;

  if (options.ignorePairsFile) {
    nonCompliantPairsToIgnore = await readFile(options.ignorePairsFile);
  }

  outPutAnalysis(
    resultArray,
    colorBlindTypes,
    outPutPath,
    exportPairsPath,
    nonCompliantPairsToIgnore
  );
}
