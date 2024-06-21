import layerPaintToZoomLevelColors from "./layerPaintToZoomLevelColors.js";
import checkContrastBetweenPairs from "./checkContrast.js";

export default function processStyles(
  layerTypes,
  data,
  colorBlindTypes,
  minMaxZoom,
  threshHold
) {
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

  layerTypes.map((t, index) => {
    resultArray[0].push(getZoomLevelColorsArray(data[index], minMaxZoom));
    resultArray[1].push(extractColorsInEachZoomLevel(resultArray[0][index]));
    resultArray[2].push(
      extractColorToLayerIDByZoomLevel(resultArray[1][index])
    );
    resultArray[3].push(getUniqueColors(resultArray[1][index]));
    resultArray[4].push(
      checkContrastBetweenPairs(
        colorBlindTypes,
        resultArray[3][index],
        threshHold
      )
    );
  });

  return resultArray;
}

export function getZoomLevelColorsArray(data, minMaxZoom) {
  const result = [];

  Object.keys(data).forEach((key) => {
    data[key].forEach((item) => {
      const zoomLevelColors = layerPaintToZoomLevelColors(
        item,
        minMaxZoom[0],
        minMaxZoom[1]
      );
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
