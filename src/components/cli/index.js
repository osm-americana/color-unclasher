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
    [minZoom, maxZoom],
    minDeltaE
  );

  let nonCompliantPairsToIgnore = null;

  if (parisToIgnorePath) {
    nonCompliantPairsToIgnore = await readFile(parisToIgnorePath);

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
    nonCompliantPairsToIgnore,
    getSuggest
  );
}
