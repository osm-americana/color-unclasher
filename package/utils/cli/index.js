import getOptions from "./utils/getOptions.js";
import extractStyle from "./utils/extractStyle.js";
import processStyles from "./utils/processStyles.js";
import outPutAnalysis from "./utils/outPutAnalysis.js";

export default async function commandLine(filePath) {
  const options = await getOptions(filePath);
  const layerTypes = ["fill", "line"];

  const colorBlindTypes = [
    "normal",
    "deuteranopia",
    "protanopia",
    "tritanopia",
  ];

  extractStyle(options.filePath)
    .then((data) => {
      const resultArray = processStyles(
        layerTypes,
        data,
        colorBlindTypes,
        options.minMaxZoom,
        options.targetDeltaE
      );
      outPutAnalysis(resultArray, colorBlindTypes, options.outputPath);
    })
    .catch((error) => {
      console.error("Error reading file:", error);
    });
}
