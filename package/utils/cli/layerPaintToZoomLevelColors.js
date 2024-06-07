import { interpolates, Color } from "@maplibre/maplibre-gl-style-spec";
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
  if (
    typeof minZoomLevel !== "number" ||
    typeof maxZoomLevel !== "number" ||
    minZoomLevel > maxZoomLevel
  ) {
    throw new Error("Invalid minZoomLevel or maxZoomLevel");
  }

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
  if (typeof style["fill-color"] === "string") {
    const zoomLevelColors = {};
    for (let i = layerMinZoom; i < layerMaxZoom + 1; i++) {
      zoomLevelColors[i] = style["fill-color"];
    }

    return [id, zoomLevelColors];
  } else {
    return getLayerColorsAtZooms(
      id,
      style["fill-color"],
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
  let interpolateType;

  if (
    Array.isArray(fillColor) &&
    fillColor[0].includes("interpolate") &&
    fillColor[1][0] === "linear" &&
    fillColor[2][0] === "zoom"
  ) {
    interpolateType = fillColor[0];
    fillColors = fillColor.slice(3);
  } else if (fillColor["stops"]) {
    interpolateType = 'stops';
    fillColors = fillColor["stops"].flat();
  } else if (fillColor[0] === 'case') {
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

    // console.log(result);

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
      interpolateType
    );
  }

  return [id, colorsAtZooms];
}

/*
Input:
[ 5, '#ff0000', 10, '#00ff00', 15, '#0000ff' ]
*/
function getInterpolatedColorAtZoom(flatPoints, value, interpolateType) {
  let points = [];
  for (let i = 0; i < flatPoints.length; i += 2) {
    points.push([flatPoints[i], flatPoints[i + 1]]);
  }

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
        let x0 = points[i - 1][0];
        let color1 = points[i - 1][1];
        let x1 = points[i][0];
        let color2 = points[i][1];
        const t = (value - x0) / (x1 - x0);

        let color;
        if (interpolateType === "interpolate" || interpolateType === 'stops') {
          color = interpolates.color(
            Color.parse(color1),
            Color.parse(color2),
            t
          );
        } else {
          color = interpolates.color(
            Color.parse(color1),
            Color.parse(color2),
            t,
            interpolateType.split("-")[1]
          );
        }

        const r = color.r * 255;
        const g = color.g * 255;
        const b = color.b * 255;

        const chromaColor = chroma(r, g, b).hex();
        return chromaColor;
      }
    }
  }
}
