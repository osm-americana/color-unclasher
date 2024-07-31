import chroma from "chroma-js";
import { parseHSL, convertToMode } from "../utils/color.js";
import tinycolor from "tinycolor2";

export default function adjustHSL(color1, color2, mode, threshHold = 7) {
  const color1Blind = convertToMode(color1, mode);
  const color2Blind = convertToMode(color2, mode);

  if (chroma.deltaE(color1Blind, color2Blind) >= threshHold) {
    return `Enough contrast: [${color1}] [${color2}]`;
  }

  const components = ["hue", "saturation", "lightness"];
  const increments = [1, -1];

  let adjustedColors = {};

  for (let component of components) {
    for (let increment of increments) {
      const adjustedColor = adjustColorComponent(
        color2,
        color1Blind,
        component,
        increment,
        mode,
        threshHold
      );

      adjustedColors[
        `${component}_${increment > 0 ? "increase" : "decrease"}`
      ] =
        adjustedColor === "----"
          ? "----"
          : tinycolor({
              h: adjustedColor["hue"],
              s: adjustedColor["saturation"],
              l: adjustedColor["lightness"],
            }).toHslString();
    }
  }

  return adjustedColors;
}

function adjustColorComponent(
  color2,
  color1Blind,
  component,
  increment,
  mode,
  threshHold
) {
  const adjustedColor = parseHSL(color2);

  while (true) {
    adjustedColor[component] = adjustedColor[component] + increment;

    const adjustedColorBlind = convertToMode(
      tinycolor({
        h: adjustedColor["hue"],
        s: adjustedColor["saturation"],
        l: adjustedColor["lightness"],
      }).toHexString(),
      mode
    );

    const deltaE = chroma.deltaE(color1Blind, adjustedColorBlind);

    if (deltaE > threshHold) {
      return adjustedColor;
    }

    if (
      component == "hue" &&
      ((increment > 0 && adjustedColor["hue"] >= 360) ||
        (increment < 0 && adjustedColor["hue"] <= 0))
    ) {
      return "----";
    } else if (
      (increment > 0 && adjustedColor[component] >= 100) ||
      (increment < 0 && adjustedColor[component] <= 0)
    ) {
      return "----";
    }
  }
}
