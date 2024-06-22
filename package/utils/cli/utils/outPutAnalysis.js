import fs from "fs";
import path from "path";
import prettier from "prettier";

export default function outPutAnalysis(
  resultArray,
  colorBlindTypes,
  outputPath,
  exportPairsPath
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
          exportPairs[type]
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
        exportPairs[type].fill
      );
      console.log("\n     type=line\n");
      writeResultToTerminal(
        resultArray[4][1][index][1],
        resultArray[2][1],
        buildExportPairs(exportPairsPath),
        exportPairs[type].line
      );
      console.log("\n");
    }
  });

  if (exportPairsPath) {
    writeResultToFile(
      JSON.stringify(exportPairs, null, 2),
      exportPairsPath,
      "Non-compliant pairs has been written to"
    );
  }

  if (outputPath) {
    writeResultToFile(
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
  }
  else {
    return () => {};
  }
}

function writeResultToTerminal(
  nonCompliantPairs,
  colorToLayerIDByZoomLevel,
  buildExportPairs,
  exportPairsCurrType
) {
  Object.keys(nonCompliantPairs).forEach((key) => {
    const pairs = nonCompliantPairs[key];

    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = colorToLayerIDByZoomLevel[key][color1];
      const name2 = colorToLayerIDByZoomLevel[key][color2];

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
  });
}

function writeResultToFile(outputMessages, outputPath, message) {
  fs.writeFile(path.resolve(outputPath), outputMessages, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing to output file:", writeErr);
      process.exit(1);
    }
    console.log(message, outputPath);
  });
}

function outputNoneCompliantPairs(
  fillNonCompliantPairs,
  fillColorToLayerIDByZoomLevel,
  lineNonCompliantPairs,
  lineColorToLayerIDByZoomLevel,
  type,
  buildExportPairs,
  exportPairsType
) {
  let outputMessages = [`------ ${type} ------\n`, "\n     type=fill\n"];
  
  pushPairsInformation(
    fillNonCompliantPairs,
    fillColorToLayerIDByZoomLevel,
    outputMessages,
    buildExportPairs,
    exportPairsType.fill
  );

  outputMessages.push("\n     type=line\n");

  pushPairsInformation(
    lineNonCompliantPairs,
    lineColorToLayerIDByZoomLevel,
    outputMessages,
    buildExportPairs,
    exportPairsType.line
  );
  outputMessages.push("\n");

  return outputMessages;
}

function pushPairsInformation(
  pairsArray,
  colorToLayerIDByZoomLevel,
  outputMessages,
  buildExportPairs,
  exportPairsCurrType
) {
  Object.keys(pairsArray).forEach((key) => {
    const pairs = pairsArray[key];
    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = colorToLayerIDByZoomLevel[key][color1];
      const name2 = colorToLayerIDByZoomLevel[key][color2];

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
