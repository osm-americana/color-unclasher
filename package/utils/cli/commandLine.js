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

  const zoomLevelColorsArray = [];
  const masterArray = [];
  const colorBlindTypes = [
    "normal",
    "deuteranopia",
    "protanopia",
    "tritanopia",
  ];

  extractStyle(filePath)
    .then((data) => {
      [0, 1].map((index) =>{
        knowKnowWhatToName(
          data[index],
          index === 0 ? zoomLevelColorsArray : masterArray
        );
      })

      const colorsInEachZoomLevel =
        extractColorsInEachZoomLevel(zoomLevelColorsArray);
      const colorToLayerIDByZoomLevel = extractColorToLayerIDByZoomLevel(colorsInEachZoomLevel);
      const uniqueColors = getUniqueColors(colorsInEachZoomLevel);

      const colorsInEachZoomLevel2 = extractColorsInEachZoomLevel(masterArray);
      const colorToLayerIDByZoomLevel2 = extractColorToLayerIDByZoomLevel(
        colorsInEachZoomLevel2
      );
      const uniqueColors2 = getUniqueColors(colorsInEachZoomLevel2);

      const nonCompliantPairsByType = checkContrastBetweenPairs(
        colorBlindTypes,
        uniqueColors
      );

      const nonCompliantPairsByType2 = checkContrastBetweenPairs(
        colorBlindTypes,
        uniqueColors2
      );

      outPutAnalysis(
        colorBlindTypes,
        nonCompliantPairsByType,
        colorToLayerIDByZoomLevel,
        outputPath,
        nonCompliantPairsByType2,
        colorToLayerIDByZoomLevel2
      );

      // outPutAnalysis(
      //   nonCompliantPairsByType2,
      //   colorToLayerIDByZoomLevel2,
      //   outputPath
      // );
    })
    .catch((error) => {
      console.error("Error reading file:", error);
    });
}

function knowKnowWhatToName(data, zoomLevelColorsArray) {
  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const zoomLevelColors = layerPaintToZoomLevelColors(item, 2, 22);
      if (!Array.isArray(zoomLevelColors)) {
        Object.keys(zoomLevelColors).forEach((key) => {
          zoomLevelColorsArray.push(zoomLevelColors[key]);
        });
      } else if (zoomLevelColors) {
        zoomLevelColorsArray.push(zoomLevelColors);
      }
    });
  });
}

function outPutAnalysis(
  colorBlindTypes,
  nonCompliantPairsByType,
  colorToLayerIDByZoomLevel,
  outputPath,
  nonCompliantPairsByType2,
  colorToLayerIDByZoomLevel2
) {
  const outputMessagesToFileByType = [];

  colorBlindTypes.map((type, index) => {
    if (outputPath) {
      outputMessagesToFileByType.push(
        outputNoneCompliantPairs(pairsArray, colorToLayerIDByZoomLevel).join("")
      );
    } else {
      console.log("------", type , "------");
      console.log("\n     type=fill\n");
      writeResultToTerminal(
        nonCompliantPairsByType[index][1],
        colorToLayerIDByZoomLevel
      );
      console.log("\n     type=line\n");
      writeResultToTerminal(
        nonCompliantPairsByType2[index][1],
        colorToLayerIDByZoomLevel2
      );
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

function writeResultToFile(outputMessages, outputPath) {
  fs.writeFile(path.resolve(outputPath), outputMessages, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing to output file:", writeErr);
      process.exit(1);
    }
    console.log("Result has been written to", outputPath);
  });
}

function outputNoneCompliantPairs(nonCompliantPairs, colorToLayerIDByZoomLevel) {
  let outputMessages = [`------ ${nonCompliantPairs[0]} ------\n`];
  const pairsArray = nonCompliantPairs[1];

  Object.keys(pairsArray).forEach((key) => {
    const pairs = pairsArray[key];
    pairs.map((p) => {
      const color1 = p[0];
      const color2 = p[1];
      const name1 = colorToLayerIDByZoomLevel[key][color1];
      const name2 = colorToLayerIDByZoomLevel[key][color2];

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
