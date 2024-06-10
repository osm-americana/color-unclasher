import colorBlind from "color-blind";
import chroma from "chroma-js";
import { returnColorInTargetFormat, getColorModel } from "./color.js";

/* 
Example usage:
const color1 = "#a4a95b";
const color2 = "#ff8375";

adjustRGB(color1, color2, deuteranopia);

Result:
{
  red_increase: '----', // means no possible result
  red_decrease: '#da8375',
  green_increase: '#ffa875',
  green_decrease: '#ff5e75',
  blue_increase: '#ff8387',
  blue_decrease: '#ff833a'
}
*/

export default function adjustRGB(color1, color2, mode, threshHold = 7) {
  const color1Blind = convertToMode(color1, mode);
  const color2Blind = convertToMode(color2, mode);
  const color2Format = getColorModel(color2);

  if (chroma.deltaE(color1Blind, color2Blind) >= threshHold) {
    return `Enough contrast: [${color1}] [${color2}]`;
  }

  const components = ["red", "green", "blue"];
  const increments = [1, -1];

  let adjustedColors = {};

  for (let component of components) {
    for (let increment of increments) {
      const adjustedColor = adjustColorComponent(
        color2,
        color2Format,
        color1Blind,
        component,
        increment,
        mode,
        threshHold
      );
      adjustedColors[
        `${component}_${increment > 0 ? "increase" : "decrease"}`
      ] = adjustedColor;
    }
  }

  return adjustedColors;
}

function adjustColorComponent(
  color2,
  color2Format,
  color1Blind,
  component,
  increment,
  mode,
  threshHold
) {
  let adjustedColor = chroma(color2).rgb();
  const index = { red: 0, green: 1, blue: 2 }[component];

  while (true) {
    adjustedColor[index] = Math.max(
      0,
      Math.min(255, adjustedColor[index] + increment)
    );
    const adjustedColorBlind = convertToMode(chroma(adjustedColor).hex(), mode);
    const deltaE = chroma.deltaE(color1Blind, adjustedColorBlind);

    if (deltaE > threshHold) {
      return returnColorInTargetFormat(adjustedColor, color2Format);
    }

    if (
      (increment > 0 && adjustedColor[index] === 255) ||
      (increment < 0 && adjustedColor[index] === 0)
    ) {
      break;
    }
  }

  return "----";
}

function convertToMode(color, mode) {
  switch (mode) {
    case "deuteranopia":
      return colorBlind.deuteranopia(color);
    case "protanopia":
      return colorBlind.protanopia(color);
    case "tritanopia":
      return colorBlind.tritanopia(color);
    default:
      console.error("Unsupported color simulation");
      process.exit(1);
  }
}
