import { checkPairExist } from "./string.js";
import { writeFile } from "./IO.js";
import adjustColor from "./../../module/adjustColor.js";

export default async function outPutAnalysis(
  resultArray,
  colorBlindTypes,
  outputPath,
  exportPairsPath,
  nonCompliantPairsToIgnore
) {
  const outputMessagesToFileByType = [];
  console.log("\n");

  const exportPairs = {
    normal: {
      fill: {},
      line: {},
    },
    deuteranopia: {
      fill: {},
      line: {},
    },
    protanopia: {
      fill: {},
      line: {},
    },
    tritanopia: {
      fill: {},
      line: {},
    },
  };

  colorBlindTypes.map((type, index) => {
    // output to file
    if (outputPath) {
      outputMessagesToFileByType.push(
        outputNoneCompliantPairs(
          resultArray[4][0][index][1],
          resultArray[2][0],
          resultArray[4][1][index][1],
          resultArray[2][1],
          type,
          buildExportPairs(exportPairsPath),
          exportPairs[type],
          nonCompliantPairsToIgnore?.[type]
        ).join("")
      );
    // output to terminal
    } else {
      console.log("------", type, "------");
      console.log("\n     type=fill\n");
      writeResultToTerminal(
        resultArray[4][0][index][1],
        resultArray[2][0],
        buildExportPairs(exportPairsPath),
        exportPairs[type].fill,
        nonCompliantPairsToIgnore?.[type]?.["fill"],
        type
      );
      console.log("\n     type=line\n");
      writeResultToTerminal(
        resultArray[4][1][index][1],
        resultArray[2][1],
        buildExportPairs(exportPairsPath),
        exportPairs[type].line,
        nonCompliantPairsToIgnore?.[type]?.["line"],
        type
      );
      console.log("\n");
    }
  });

  if (exportPairsPath) {
    await writeFile(
      JSON.stringify(exportPairs, null, 2),
      exportPairsPath,
      "Non-compliant pairs has been written to"
    );
  }

  if (outputPath) {
    await writeFile(
      outputMessagesToFileByType.join(""),
      outputPath,
      "Result has been written to"
    );
  }
}

function buildExportPairs(exportPairsPath) {
  if (exportPairsPath) {
    return function writeToExportPairs(exportPairsCurrType, key, name1, name2) {
      if (Array.isArray(exportPairsCurrType[key])) {
        exportPairsCurrType[key].push([name1, name2]);
      } else {
        exportPairsCurrType[key] = [[name1, name2]];
      }
    };
  } else {
    return () => {};
  }
}

function writeResultToTerminal(
  nonCompliantPairs,
  colorToLayerIDByZoomLevel,
  buildExportPairs,
  exportPairsCurrType,
  nonCompliantPairsToIgnore,
  type
) {
  Object.keys(nonCompliantPairs).forEach((key) => {
    const pairs = nonCompliantPairs[key];
    const colorsAtCurrZoom = Object.keys(colorToLayerIDByZoomLevel[key]);
    const indexOfPairsToIgnore = [];

    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = colorToLayerIDByZoomLevel[key][color1];
      const name2 = colorToLayerIDByZoomLevel[key][color2];

      // if the pair is configured to be ignored, then don't output
      if (
        nonCompliantPairsToIgnore &&
        nonCompliantPairsToIgnore[key] &&
        checkPairExist(nonCompliantPairsToIgnore[key], name1[0], name2[0])
      ) {
        indexOfPairsToIgnore.push([
          colorsAtCurrZoom.indexOf(color1),
          colorsAtCurrZoom.indexOf(color2),
        ]);
        return null;
      }

      /* For paint expressions that contains case
         For example, for layerID "water"
         "fill-color": [
           "case",
           [
             "any",
             ["==", ["get", "intermittent"], 1],
             ["==", ["get", "brunnel"], "tunnel"]
           ],
           "hsl(211, 60%, 85%)",
           "hsl(211, 50%, 85%)"
         ]
         would result in two colors depending on the cases
         so we don't want to mark this pair as need more contrast */
      if (Array.isArray(name1[0]) && Array.isArray(name2[0])) {
        if (name1[0][0] === name2[0][0]) {
          indexOfPairsToIgnore.push([
            colorsAtCurrZoom.indexOf(color1),
            colorsAtCurrZoom.indexOf(color2),
          ]);
          return null;
        }
      }

      buildExportPairs(exportPairsCurrType, key, name1, name2);

      console.log(
        `Zoom ${key}`,
        name1,
        [color1],
        "and",
        name2,
        [color2],
        "are too similar"
      );
    });

    const result = adjustColor(
      colorsAtCurrZoom,
      indexOfPairsToIgnore,
      type,
      5.5
    );
    if (result.length > 0) {
      const map1 = new Map();
      const keys = Object.keys(colorToLayerIDByZoomLevel[key]);
      result.map((r) => {
        const condition = colorToLayerIDByZoomLevel[key][keys[r[0]]];
        map1.set(condition, [r[2]]);
      });

      for (const key of map1.keys()) {
        console.log("   Change", key, "to", map1.get(key), '\n');
      }
    }
  });
}

function outputNoneCompliantPairs(
  fillNonCompliantPairs,
  fillColorToLayerIDByZoomLevel,
  lineNonCompliantPairs,
  lineColorToLayerIDByZoomLevel,
  type,
  buildExportPairs,
  exportPairsType,
  nonCompliantPairsToIgnore
) {
  let outputMessages = [`------ ${type} ------\n`, "\n     type=fill\n"];

  pushPairsInformation(
    fillNonCompliantPairs,
    fillColorToLayerIDByZoomLevel,
    outputMessages,
    buildExportPairs,
    exportPairsType.fill,
    nonCompliantPairsToIgnore?.fill
  );

  outputMessages.push("\n     type=line\n");

  pushPairsInformation(
    lineNonCompliantPairs,
    lineColorToLayerIDByZoomLevel,
    outputMessages,
    buildExportPairs,
    exportPairsType.line,
    nonCompliantPairsToIgnore?.line
  );
  outputMessages.push("\n");

  return outputMessages;
}

function pushPairsInformation(
  pairsArray,
  colorToLayerIDByZoomLevel,
  outputMessages,
  buildExportPairs,
  exportPairsCurrType,
  nonCompliantPairsToIgnore
) {
  Object.keys(pairsArray).forEach((key) => {
    const pairs = pairsArray[key];
    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = colorToLayerIDByZoomLevel[key][color1];
      const name2 = colorToLayerIDByZoomLevel[key][color2];

      // if the pair is configured to be ignored, then don't output
      if (
        nonCompliantPairsToIgnore &&
        nonCompliantPairsToIgnore[key] &&
        checkPairExist(nonCompliantPairsToIgnore[key], name1[0], name2[0])
      ) {
        return null;
      }

      /* For paint expressions that contains case
         For example, for layerID "water"
         "fill-color": [
           "case",
           [
             "any",
             ["==", ["get", "intermittent"], 1],
             ["==", ["get", "brunnel"], "tunnel"]
           ],
           "hsl(211, 60%, 85%)",
           "hsl(211, 50%, 85%)"
         ]
         would result in two colors depending on the cases
         so we don't want to mark this pair as need more contrast */
      if (Array.isArray(name1) && Array.isArray(name2)) {
        if (name1[0][0] === name2[0][0]) {
          return null;
        }
      }

      buildExportPairs(exportPairsCurrType, key, name1, name2);

      outputMessages.push(
        `Zoom ${key} [ "${name1}" ] ${color1} and [ "${name2}" ] ${color2} are too similar\n`
      );
    });
  });
}
