import fs from "fs";
import path from "path";

export default function outPutAnalysis(
  resultArray,
  colorBlindTypes,
  outputPath
) {
  const outputMessagesToFileByType = [];
  console.log("\n");

  colorBlindTypes.map((type, index) => {
    // output to file
    if (outputPath) {
      outputMessagesToFileByType.push(
        outputNoneCompliantPairs(
          resultArray[4][0][index][1],
          resultArray[2][0]
        ).join("")
      );
      // output to terminal
    } else {
      console.log("------", type, "------");
      console.log("\n     type=fill\n");
      writeResultToTerminal(resultArray[4][0][index][1], resultArray[2][0]);
      console.log("\n     type=line\n");
      writeResultToTerminal(resultArray[4][1][index][1], resultArray[2][1]);
      console.log("\n");
    }
  });

  if (outputPath) {
    writeResultToFile(outputMessagesToFileByType.join(""), outputPath);
  }
}

function writeResultToTerminal(nonCompliantPairs, colorToLayerIDByZoomLevel) {
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

      console.log(`Zoom ${key}`, name1, [color1], "and", name2, [color2]);
    });
  });
}

function writeResultToFile(outputMessages, outputPath) {
  fs.writeFile(path.resolve(outputPath), outputMessages, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing to output file:", writeErr);
      process.exit(1);
    }
    console.log("Result has been written to", outputPath);
  });
}

function outputNoneCompliantPairs(
  nonCompliantPairs,
  colorToLayerIDByZoomLevel
) {
  let outputMessages = [`------ ${nonCompliantPairs[0]} ------\n`];
  const pairsArray = nonCompliantPairs[1];

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

      outputMessages.push(
        `Zoom ${key} [ "${name1}" ] ${color1} and [ "${name2}" ] ${color2}\n`
      );
    });
  });

  outputMessages.push("\n");

  return outputMessages;
}
