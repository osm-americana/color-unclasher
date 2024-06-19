import getOptions from "./utils/getOptions.js";
import extractStyle from "./utils/extractStyle.js";
import processStyles from "./utils/processStyles.js";
import outPutAnalysis from "./utils/outPutAnalysis.js";

export default async function commandLine(filePath, outPutPath) {
  const options = await getOptions();
  const layerTypes = ["fill", "line"];

  const colorBlindTypes = [
    "normal",
    "deuteranopia",
    "protanopia",
    "tritanopia",
  ];

  extractStyle(filePath)
    .then((data) => {
      const resultArray = processStyles(
        layerTypes,
        data,
        colorBlindTypes,
        options.minMaxZoom,
        options.targetDeltaE
      );
      outPutAnalysis(resultArray, colorBlindTypes, outPutPath);
    })
    .catch((error) => {
      console.error("Error reading file:", error);
    });
}
