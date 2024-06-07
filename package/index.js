#!/usr/bin/env node

import layerPaintToZoomLevelColors from "./layerPaintToZoomLevelColors.js";
import extractStyle from "./extractStyle.js";
import checkContrastBetweenPairs from "./checkContrast.js";
import fs from "fs";
import path from "path";

const [mode, filePath, outputPath] = process.argv.slice(2);

if (!filePath) {
  console.error("Please provide a path to the JSON file");
  process.exit(1);
}

if (mode !== "analysis") {
  console.error("Please provide a correct mode name");
  process.exit(1);
}

const zoomLevelColorsArray = [];
const colorBlindTypes = ["normal", "deuteranopia", "protanopia", "tritanopia"];

extractStyle(filePath)
  .then((data) => {
    Object.keys(data).forEach((key) => {
      data[key].forEach((item) => {
        const zoomLevelColors = layerPaintToZoomLevelColors(item, 2, 22);
        if (!Array.isArray(zoomLevelColors)) {
          Object.keys(zoomLevelColors).forEach((key) => {
            zoomLevelColorsArray.push(zoomLevelColors[key]);
          })
        }
        else if (zoomLevelColors) {
          zoomLevelColorsArray.push(zoomLevelColors);
        }
      });
    });

    const colorsInEachZoomLevel =
      extractColorsInEachZoomLevel(zoomLevelColorsArray);
    const zoomLevelColorMap = extractZoomLevelColorMap(colorsInEachZoomLevel);
    const uniqueColors = getUniqueColors(colorsInEachZoomLevel);
    const nonCompliantPairsByType = checkContrastBetweenPairs(
      colorBlindTypes,
      uniqueColors
    );

    outPutAnalysis(nonCompliantPairsByType, zoomLevelColorMap);
  })
  .catch((error) => {
    console.error("Error reading file:", error);
  });

function outPutAnalysis(nonCompliantPairsByType, zoomLevelColorMap) {
  const outputMessagesToFileByType = [];

  nonCompliantPairsByType.map((pairsArray) => {
    if (Object.keys(pairsArray[1]).length === 0) {
      console.log('***', [ pairsArray[0] ], 'mode: everything_looks good! ***');
    } else {
      if (outputPath) {
        outputMessagesToFileByType.push(
          outputNoneCompliantPairs(pairsArray, zoomLevelColorMap).join("")
        );
      } else {
        console.log("------", pairsArray[0], "------");
        writeResultToTerminal(pairsArray[1], zoomLevelColorMap);
        console.log("\n");
      }
    }
  });

  if (outputPath) {
    writeResultToFile(outputMessagesToFileByType.join(""));
  }
}

function writeResultToTerminal(nonCompliantPairs, zoomLevelColorMap) {
  Object.keys(nonCompliantPairs).forEach((key) => {
    const pairs = nonCompliantPairs[key];

    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = zoomLevelColorMap[key][color1];
      const name2 = zoomLevelColorMap[key][color2];

      // For paint expressions that contains case
      // For example, for layerID "water"
      // "fill-color": [
      //   "case",
      //   [
      //     "any",
      //     ["==", ["get", "intermittent"], 1],
      //     ["==", ["get", "brunnel"], "tunnel"]
      //   ],
      //   "hsl(211, 60%, 85%)",
      //   "hsl(211, 50%, 85%)"
      // ]
      // would result in two colors depending on the cases
      // so we don't want to mark this pair as need more contrast
      if (Array.isArray(name1) && Array.isArray(name2)) {
        if (name1[0][0] === name2[0][0]) {
          return null;
        }
      }
          
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

function writeResultToFile(outputMessages) {
  fs.writeFile(path.resolve(outputPath), outputMessages, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing to output file:", writeErr);
      process.exit(1);
    }
    console.log("Result has been written to", outputPath);
  });
}

function outputNoneCompliantPairs(nonCompliantPairs, zoomLevelColorMap) {
  let outputMessages = [`------ ${nonCompliantPairs[0]} ------\n`];
  const pairsArray = nonCompliantPairs[1];

  Object.keys(pairsArray).forEach((key) => {
    const pairs = pairsArray[key];
    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = zoomLevelColorMap[key][color1];
      const name2 = zoomLevelColorMap[key][color2];

      // For paint expressions that contains case
      // For example, for layerID "water"
      // "fill-color": [
      //   "case",
      //   [
      //     "any",
      //     ["==", ["get", "intermittent"], 1],
      //     ["==", ["get", "brunnel"], "tunnel"]
      //   ],
      //   "hsl(211, 60%, 85%)",
      //   "hsl(211, 50%, 85%)"
      // ]
      // would result in two colors depending on the cases
      // so we don't want to mark this pair as need more contrast
      if (Array.isArray(name1) && Array.isArray(name2)) {
        if (name1[0][0] === name2[0][0]) {
          return null;
        }
      }

      outputMessages.push(
        `Zoom ${key} [ "${name1}" ] ${color1} and [ "${name2}" ] ${color2} are too similar\n`
      );
    });
  });

  outputMessages.push("\n");

  return outputMessages;
}

/*

Output:
{
  '0': {
    landuse_school: '#FFC7E2',
    landuse_errr: '#ff0000',
    landuse_hospital: '#FFDDDD'
  },
  '1': {
    landuse_school: '#FFC7E2',
    landuse_errr: '#ff0000',
    landuse_hospital: '#FFDDDD'
  },
  '2': {
    landuse_school: '#FFC7E2',
    landuse_errr: '#ff0000',
    landuse_hospital: '#FFDDDD'
  }
}
*/
function extractColorsInEachZoomLevel(layers) {
    const result = {};

    layers.forEach(([layerName, zoomLevels]) => {
      Object.keys(zoomLevels).forEach((zoomLevel) => {
        if (!result[zoomLevel]) {
          result[zoomLevel] = [];
        }
        result[zoomLevel].push([layerName, zoomLevels[zoomLevel]]);
      });
    });

    return result;
}

/*
Output:
{
  '2': {
    'rgba(169,90,161,0.49)': [ 'Place of worship' ],
    'rgba(169,90,161,1)': [ 'Moor or heathland' ]
  },
  '3': {
    'rgba(169,90,161,0.49)': [ 'Place of worship' ],
    'rgba(169,90,161,1)': [ 'Moor or heathland' ]
  },
  '4': {
    'rgba(169,90,161,0.49)': [ 'Place of worship' ],
    'rgba(169,90,161,1)': [ 'Moor or heathland' ]
  }
}
*/
function extractZoomLevelColorMap(input) {
  const result = {};

  for (const [zoom, layers] of Object.entries(input)) {
    const colorMap = new Map();

    layers.map((l) => {
      const layerName = l[0];
      const color = l[1];
      if (!colorMap.has(color)) {
        colorMap.set(color, []);
      }
      colorMap.get(color).push(layerName);
    })

    result[parseInt(zoom, 10)] = Object.fromEntries(colorMap);
  }

  return result;
}

/*
New InPut: 
{
  '2': [
    [ 'background', 'hsl(30, 44%, 96%)' ],
    [ 'landuse_hospital', '#FFDDDD' ],
    [ [Array], 'hsl(211, 60%, 85%)' ],
    [ [Array], 'hsl(211, 50%, 85%)' ]
  ],
  '3': [
    [ 'background', 'hsl(30, 44%, 96%)' ],
    [ 'landuse_hospital', '#FFDDDD' ],
    [ [Array], 'hsl(211, 60%, 85%)' ],
    [ [Array], 'hsl(211, 50%, 85%)' ]
  ]
}

Output:
[
  [ 0, [ '#FFC7E2', '#ff0000', '#FFDDDD' ] ],
  [ 1, [ '#FFC7E2', '#ff0000', '#FFDDDD' ] ],
  [ 2, [ '#FFC7E2', '#ff0000', '#FFDDDD' ] ],
]
*/
function getUniqueColors(data) {
  return Object.entries(data).map(([zoomLevel, colorsArray]) => {
    const uniqueColors = [...new Set(colorsArray.map((c) => c[1]))];
    return [parseInt(zoomLevel), uniqueColors];
  });
}
