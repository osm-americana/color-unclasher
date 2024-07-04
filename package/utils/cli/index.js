import getOptions from "./utils/getOptions.js";
import extractStyle from "./utils/extractStyle.js";
import processStyles from "./utils/processStyles.js";
import outPutAnalysis from "./utils/outPutAnalysis.js";
import { readFile, isValidStructure } from "./utils/IO.js";

import fs from "fs";

export default async function commandLine(filePath, outPutPath, exportPairsPath) {
  const options = await getOptions();

  if (options.minZoomLevel > options.maxZoomLevel) {
    throw new Error("maxZoom must be greater than or equal to minZoom");
  }

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

    try {
      isValidStructure(nonCompliantPairsToIgnore, colorBlindTypes, layerTypes);
    } catch (err) {
      console.log(
        "\nThe file fed for non-compliant pairs to ignore might not be in the right format."
      );
      console.log(
        "Process terminated. Either correct the format based on documentation, or don't feed the file when prompted."
      );
      console.log(err);
      return;
    }
  }

  await outPutAnalysis(
    resultArray,
    colorBlindTypes,
    outPutPath,
    exportPairsPath,
    nonCompliantPairsToIgnore
  );
}
