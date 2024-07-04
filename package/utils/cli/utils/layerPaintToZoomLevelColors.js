import {
  Interpolate, interpolates,
  Color,
} from "@maplibre/maplibre-gl-style-spec";
import chroma from "chroma-js";

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

  // Simple fill color value like "#fff"
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
  let fillColors;
  const colorsAtZooms = {};
  const interpolationType = {};
  let interpolationColorSpace = 'rgb';

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
    fillColors = fillColor.slice(3);
  // regular stops
  } else if (fillColor?.["stops"]) {
    interpolationType['name'] = 'linear';
    fillColors = fillColor["stops"].flat();
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

  for (let i = minZoomLevel; i < maxZoomLevel + 1; i++) {
    colorsAtZooms[i] = getInterpolatedColorAtZoom(
      fillColors,
      i,
      interpolationType,
      interpolationColorSpace,
    );
  }

  return [id, colorsAtZooms];
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
function getInterpolatedColorAtZoom(
  flatPoints,
  value,
  interpolationType,
  interpolationColorSpace
) {

  if ( interpolationColorSpace !== "rgb" && interpolationColorSpace !== "hcl" &&
    interpolationColorSpace !== "lab" ) {
    console.error(
      "Invalid interpolation color space. Must be rgb, hcl, or lab",
      interpolationColorSpace
    );
    process.exit(1);
  }

  let points = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    console.log(flatPoints[i], flatPoints[i + 1]);
    points.push([flatPoints[i], flatPoints[i + 1]]);
  }

  console.log(flatPoints, points);

  if (value <= points[0][0]) {
    return points[0][1];
  } else if (value >= points[points.length - 1][0]) {
    return points[points.length - 1][1];
  } else {
    for (let i = 1; i < points.length; i++) {
      if (value == points[i][0]) {
        return points[i][1];
      }

      if (value < points[i][0]) {
        let lowerValue = points[i - 1][0];
        let color1 = points[i - 1][1];
        let higherValue = points[i][0];
        let color2 = points[i][1];

        const t = Interpolate.interpolationFactor(
          interpolationType,
          value,
          lowerValue,
          higherValue
        );

        const color = interpolates.color(
          Color.parse(color1),
          Color.parse(color2),
          t,
          interpolationColorSpace
        );

        const r = color.r * 255;
        const g = color.g * 255;
        const b = color.b * 255;

        const chromaColor = chroma(r, g, b).hex();
        return chromaColor;
      }
    }
  }
}
