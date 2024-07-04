import {
  Interpolate,
  interpolates,
  Color,
} from "@maplibre/maplibre-gl-style-spec";
import chroma from "chroma-js";

function convertToFormat(layerID, expression) {
  const stepValues = expression.slice(3).filter((_, i) => i % 2 === 0);
  const matchExpressions = expression.slice(3).filter((_, i) => i % 2 !== 0);
  const numberOfMatchCases = (matchExpressions[0].length - 3) / 2 + 1;
  const matchCases = matchExpressions[0].slice(2).filter((_, i, arr) => i % 2 === 0 && i < arr.length - 1);

  const condition = matchExpressions[0][1];
  const result = [];
  let index = 0;
  let step = stepValues[index];

  for (let matchCaseIndex = 0; matchCaseIndex < numberOfMatchCases; matchCaseIndex++) {
    const layer = {};

    for (let zoom = 4; zoom <= 10; zoom++) {
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


        const t = Interpolate.interpolationFactor(
          {
            name: "exponential",
            base: 1.2,
          },
          zoom,
          stepValues[index - 1],
          step
        );

        const color = interpolates.color(
          Color.parse(colorList1[matchCaseIndex]),
          Color.parse(colorList[matchCaseIndex]),
          t
        );

        const r = color.r * 255;
        const g = color.g * 255;
        const b = color.b * 255;

        const chromaColor = chroma(r, g, b).hex();

        layer[zoom] = chromaColor;
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

    result.push([name, layer]);

    index = 0;
    step = stepValues[index];
  }

  return JSON.stringify(result, null, 4);
}

const expression = {
  "line-color": [
    "interpolate",
    ["exponential", 1.2],
    ["zoom"],
    5,
    [
      "match",
      ["coalesce", ["get", "toll"], 0],
      3, "hsl(0, 100%, 90%)",
      4, "hsl(0, 50%, 90%)",
      "hsl(0, 10%, 90%)",
    ],
    9,
    [
      "match",
      ["coalesce", ["get", "toll"], 0],
      3, "hsl(48, 100%, 10%)",
      4, "hsl(48, 55%, 10%)",
      "hsl(48, 10%, 10%)",
    ],
  ],
};

console.log(convertToFormat('layerID', expression["line-color"]));