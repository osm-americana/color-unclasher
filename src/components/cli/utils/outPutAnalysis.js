import { checkPairExist } from "./string.js";
import { writeFile } from "./IO.js";
import adjustColor from "./../../module/adjustColor.js";

export default async function outPutAnalysis(
  resultArray,
  colorBlindModes,
  outputPath,
  exportPairsPath,
  nonCompliantPairsToIgnore,
  getSuggest,
  minDeltaE
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

  colorBlindModes.map((mode, index) => {
    // output to file
    if (outputPath) {
      outputMessagesToFileByType.push(
        outputNoneCompliantPairs(
          resultArray[4][0][index][1],
          resultArray[2][0],
          resultArray[4][1][index][1],
          resultArray[2][1],
          mode,
          buildExportPairs(exportPairsPath),
          exportPairs[mode],
          nonCompliantPairsToIgnore?.[mode],
          getSuggest,
          minDeltaE
        ).join("")
      );
      // output to terminal
    } else {
      console.log("------", mode, "------");
      console.log("\n     mode=fill\n");
      writeResultToTerminal(
        resultArray[4][0][index][1],
        resultArray[2][0],
        buildExportPairs(exportPairsPath),
        exportPairs[mode].fill,
        nonCompliantPairsToIgnore?.[mode]?.["fill"],
        mode,
        getSuggest,
        minDeltaE
      );
      console.log("\n     mode=line\n");
      writeResultToTerminal(
        resultArray[4][1][index][1],
        resultArray[2][1],
        buildExportPairs(exportPairsPath),
        exportPairs[mode].line,
        nonCompliantPairsToIgnore?.[mode]?.["line"],
        mode,
        getSuggest,
        minDeltaE
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
  mode,
  getSuggest,
  minDeltaE
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

    if (getSuggest) {
      const result = adjustColor(
        colorsAtCurrZoom,
        indexOfPairsToIgnore,
        mode,
        minDeltaE
      );
      if (result.length > 0) {
        const map1 = new Map();
        const keys = Object.keys(colorToLayerIDByZoomLevel[key]);
        result.map((r) => {
          const condition = colorToLayerIDByZoomLevel[key][keys[r[0]]];
          map1.set(condition, [r[2]]);
        });

        for (const key of map1.keys()) {
          console.log("   Change", key, "to", map1.get(key), "\n");
        }
      }
    }
  });
}

function outputNoneCompliantPairs(
  fillNonCompliantPairs,
  fillColorToLayerIDByZoomLevel,
  lineNonCompliantPairs,
  lineColorToLayerIDByZoomLevel,
  mode,
  buildExportPairs,
  exportPairsType,
  nonCompliantPairsToIgnore,
  getSuggest,
  minDeltaE
) {
  let outputMessages = [`------ ${mode} ------\n`, "\n     mode=fill\n"];

  pushPairsInformation(
    fillNonCompliantPairs,
    fillColorToLayerIDByZoomLevel,
    outputMessages,
    buildExportPairs,
    exportPairsType.fill,
    nonCompliantPairsToIgnore?.fill,
    mode,
    getSuggest,
    minDeltaE
  );

  outputMessages.push("\n     mode=line\n");

  pushPairsInformation(
    lineNonCompliantPairs,
    lineColorToLayerIDByZoomLevel,
    outputMessages,
    buildExportPairs,
    exportPairsType.line,
    nonCompliantPairsToIgnore?.line,
    mode,
    getSuggest,
    minDeltaE
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
  nonCompliantPairsToIgnore,
  mode,
  getSuggest,
  minDeltaE
) {
  Object.keys(pairsArray).forEach((key) => {
    const colorsAtCurrZoom = Object.keys(colorToLayerIDByZoomLevel[key]);
    const indexOfPairsToIgnore = [];
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

      outputMessages.push(
        `Zoom ${key} [ "${name1}" ] ${color1} and [ "${name2}" ] ${color2} are too similar\n`
      );

      if (getSuggest) {
        const result = adjustColor(
          colorsAtCurrZoom,
          indexOfPairsToIgnore,
          mode,
          minDeltaE
        );
        if (result.length > 0) {
          const map1 = new Map();
          const keys = Object.keys(colorToLayerIDByZoomLevel[key]);
          result.map((r) => {
            const condition = colorToLayerIDByZoomLevel[key][keys[r[0]]];
            map1.set(condition, [r[2]]);
          });

          for (const key of map1.keys()) {
            outputMessages.push("   Change [ ", key, " ] to ", map1.get(key), "\n", "\n");
          }
        }
      }
    });
  });
}
