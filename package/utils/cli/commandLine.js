import layerPaintToZoomLevelColors from "./layerPaintToZoomLevelColors.js";
import extractStyle from "./extractStyle.js";
import checkContrastBetweenPairs from "./checkContrast.js";
import fs from "fs";
import path from "path";

export default function commandLine(process) {
  const [filePath, outputPath] = process.argv.slice(2);

  if (!filePath) {
    console.error("Please provide a path to the JSON file");
    process.exit(1);
  }

  /*
  resultArray structure:
  [
    [
      fillZoomLevelColorsArray, lineZoomLevelColorsArray
    ],
    [
      fillColorsInEachZoomLevel, lineColorsInEachZoomLevel
    ],
    [
      fillColorToLayerIDByZoomLevel, lineColorToLayerIDByZoomLevel
    ],
    [
      fillUniqueColors, lineUniqueColors
    ],
    [
      fillNonCompliantPairsByType, lineNonCompliantPairsByType
    ],
  ]
  */
  const resultArray = [[], [], [], [], []];
  const layerTypes = ["fill", "line"];

  const colorBlindTypes = [
    "normal",
    "deuteranopia",
    "protanopia",
    "tritanopia",
  ];

  extractStyle(filePath)
    .then((data) => {
      layerTypes.map((t, index) => {
        resultArray[0].push(getZoomLevelColorsArray(data[index], resultArray));
        resultArray[1].push(
          extractColorsInEachZoomLevel(resultArray[0][index])
        );
        resultArray[2].push(
          extractColorToLayerIDByZoomLevel(resultArray[1][index])
        );
        resultArray[3].push(getUniqueColors(resultArray[1][index]));
        resultArray[4].push(
          checkContrastBetweenPairs(colorBlindTypes, resultArray[3][index])
        );
      });

      outPutAnalysis(resultArray, colorBlindTypes, outputPath);
    })
    .catch((error) => {
      console.error("Error reading file:", error);
    });
}

function getZoomLevelColorsArray(data, resultArray) {
  const result = [];

  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const zoomLevelColors = layerPaintToZoomLevelColors(item, 2, 22);
      if (!Array.isArray(zoomLevelColors)) {
        Object.keys(zoomLevelColors).forEach((key) => {
          result.push(zoomLevelColors[key]);
        });
      } else if (zoomLevelColors) {
        result.push(zoomLevelColors);
      }
    });
  });

  return result;
}

function outPutAnalysis(resultArray, colorBlindTypes, outputPath) {
  const outputMessagesToFileByType = [];

  colorBlindTypes.map((type, index) => {
    if (outputPath) {
      outputMessagesToFileByType.push(
        outputNoneCompliantPairs(
          resultArray[4][0][index][1],
          resultArray[2][0]
        ).join("")
      );
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
function extractColorsInEachZoomLevel(zoomLevelColorsArray) {
  const result = {};

  zoomLevelColorsArray.forEach(([layerName, zoomLevels]) => {
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
function extractColorToLayerIDByZoomLevel(input) {
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
    });

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
