import getOptions from "./utils/getOptions.js";
import extractStyle from "./utils/extractStyle.js";
import processStyles from "./utils/processStyles.js";
import outPutAnalysis from "./utils/outPutAnalysis.js";

export default async function commandLine(filePath, outPutPath, exportPairs) {
  const options = await getOptions();
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
  outPutAnalysis(resultArray, colorBlindTypes, outPutPath);
}
