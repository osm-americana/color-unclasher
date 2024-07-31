import { getInterpolatedColor } from '../../utils/color.js';

/*
  Input: {
  "fill-color": [
    "interpolate",
    [
      "linear"
    ],
    [
      "zoom"
    ],
    5,
    "#ff0000",
    10,
    "#00ff00",
    15,
    "#0000ff"
  ]
}
*/
export default function layerPaintToZoomLevelColors(
  layer,
  minZoomLevel = 0,
  maxZoomLevel = 20
) {
  const id = layer.id;
  const style = layer.paint;

  let layerMinZoom = minZoomLevel;
  let layerMaxZoom = maxZoomLevel;

  if (layer.minZoom) {
    layerMinZoom = layer.minZoom;
  }

  if (layer.maxZoom) {
    layerMaxZoom = layer.maxZoom;
  }

  // const actualStyle = style["fill-color"]
  //   ? style["fill-color"]
  //   : style["background-color"];

  // Simple fill color currZoom like "#fff"
  if (typeof style["fill-color"] === "string" || typeof style["line-color"] === "string") {
    const zoomLevelColors = {};
    const color = style["fill-color"] || style["line-color"];
    for (let i = layerMinZoom; i < layerMaxZoom + 1; i++) {
      zoomLevelColors[i] = color;
    }

    return [id, zoomLevelColors];
  } else {
    return getLayerColorsAtZooms(
      id,
      style["fill-color"] || style["line-color"],
      layerMinZoom,
      layerMaxZoom
    );
  }
}

/*
  Input: [
    'interpolate', [ 'linear' ],
    [ 'zoom' ],    5,
    '#ff0000',     10,
    '#00ff00',     15,
    '#0000ff'
  ]
*/
function getLayerColorsAtZooms(
  id,
  fillColor,
  minZoomLevel,
  maxZoomLevel
) {
  let colorSpecification;
  const colorsAtZooms = {};
  const interpolationType = {};
  let interpolationColorSpace = 'rgb';

  if (fillColor === undefined) {
    throw new Error('Error parsing paint. Could be a fill-color property has been assigned to a layer with type=line.');
  }

  // Interpolate
  if (
    Array.isArray(fillColor) &&
    fillColor[0].includes("interpolate")
  ) {
    const type = fillColor[1];
    interpolationColorSpace = fillColor[0].split("-")[1] || 'rgb';

    type.map((p, index) => {
      const key = index == 0 ? "name" : (typeof p === 'number' ? 'base' : 'controlPoints' );
      interpolationType[key] = p;
    })
    colorSpecification = fillColor.slice(3);
  // regular stops
  } else if (fillColor?.["stops"]) {
    interpolationType['name'] = 'linear';
    colorSpecification = fillColor["stops"].flat();
  // Case
  } else if (fillColor?.[0] === 'case') {
    const conditionList = fillColor[1].slice(1);
    // console.log("conditionList", conditionList, conditionList.length);
    const colorList = fillColor.slice(2);

    const result = {};
    // console.log("colorList", colorList, colorList.length);

    conditionList.map((condition, index) => {
      const zoomLevelColors = {};
      for (let i = minZoomLevel; i < maxZoomLevel + 1; i++) {
        zoomLevelColors[i] = colorList[index];
      }
      result[index] = [[id, condition.toString()], zoomLevelColors];
    })

    // return null;
    return result;
  } else {
    console.log("---", fillColor);
    throw new Error("unknown type", fillColor);
  }

  if (
    interpolationColorSpace !== "rgb" &&
    interpolationColorSpace !== "hcl" &&
    interpolationColorSpace !== "lab"
  ) {
    console.error(
      "Invalid interpolation color space. Must be rgb, hcl, or lab:",
      interpolationColorSpace
    );
    process.exit(1);
  }

  if (colorSpecification?.[1]?.[0] === "match") {
    return convertToFormat(
      id,
      fillColor,
      interpolationType,
      interpolationColorSpace,
      minZoomLevel,
      maxZoomLevel
    );
  }

  for (let i = minZoomLevel; i < maxZoomLevel + 1; i++) {
    colorsAtZooms[i] = getInterpolatedColorAtCurrZoomLevel(
      colorSpecification,
      i,
      interpolationType,
      interpolationColorSpace,
    );
  }

  return [id, colorsAtZooms];
}

function convertToFormat(
  layerID,
  expression,
  interpolationType,
  interpolationColorSpace,
  minZoomLevel,
  maxZoomLevel
) {
  const stepValues = expression.slice(3).filter((_, i) => i % 2 === 0);
  const matchExpressions = expression.slice(3).filter((_, i) => i % 2 !== 0);
  const numberOfMatchCases = (matchExpressions[0].length - 3) / 2 + 1;
  const matchCases = matchExpressions[0]
    .slice(2)
    .filter((_, i, arr) => i % 2 === 0 && i < arr.length - 1);

  const condition = matchExpressions[0][1];
  const result = {};
  let index = 0;
  let step = stepValues[index];

  for (
    let matchCaseIndex = 0;
    matchCaseIndex < numberOfMatchCases;
    matchCaseIndex++
  ) {
    const layer = {};

    for (let zoom = minZoomLevel; zoom <= maxZoomLevel; zoom++) {
      const colorList = matchExpressions[index]
        .slice(2)
        .filter((_, i, arr) => i === arr.length - 1 || i % 2 !== 0);

      if (zoom < step && index == 0) {
        layer[zoom] = colorList[matchCaseIndex];
      } else if (zoom == step) {
        layer[zoom] = colorList[matchCaseIndex];
        if (index !== 1) {
          index++;
          step = stepValues[index];
        }
      } else if (zoom < step && index > 0) {
        const colorList1 = matchExpressions[index - 1]
          .slice(2)
          .filter((_, i, arr) => i === arr.length - 1 || i % 2 !== 0);

        layer[zoom] = getInterpolatedColor(
          zoom,
          stepValues[index - 1],
          step,
          interpolationType,
          interpolationColorSpace,
          colorList1[matchCaseIndex],
          colorList[matchCaseIndex]
        );
      } else if (zoom > step) {
        layer[zoom] = colorList[matchCaseIndex];
      }
    }

    let name;

    if (matchCaseIndex == numberOfMatchCases - 1) {
      name = [[layerID], condition, "default"];
    } else {
      name = [[layerID], condition, matchCases[matchCaseIndex]];
    }

    result[matchCaseIndex] = [name, layer];

    index = 0;
    step = stepValues[index];
  }

  return result;
}

/*
Input:
[ 5, '#ff0000', 10, '#00ff00', 15, '#0000ff' ]

interpolationType:
{
    name: 'linear';
} | {
    name: 'exponential';
    base: number;
} | {
    name: 'cubic-bezier';
    controlPoints: [number, number, number, number];
};
*/
function getInterpolatedColorAtCurrZoomLevel(
  colorSpecification,
  currZoom,
  interpolationType,
  interpolationColorSpace
) {

  let points = [];
  for (let i = 0; i < colorSpecification.length; i += 2) {
    points.push([colorSpecification[i], colorSpecification[i + 1]]);
  }

  if (currZoom <= points[0][0]) {
    return points[0][1];
  } else if (currZoom >= points[points.length - 1][0]) {
    return points[points.length - 1][1];
  } else {
    for (let i = 1; i < points.length; i++) {
      if (currZoom == points[i][0]) {
        return points[i][1];
      }

      if (currZoom < points[i][0]) {
        let lowerValue = points[i - 1][0];
        let color1 = points[i - 1][1];
        let higherValue = points[i][0];
        let color2 = points[i][1];

        return getInterpolatedColor(
          currZoom,
          lowerValue,
          higherValue,
          interpolationType,
          interpolationColorSpace,
          color1,
          color2
        );
      }
    }
  }
}
