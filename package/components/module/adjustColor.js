import chroma from "chroma-js";
import adjustRGB from "./adjustRGB.js";
import adjustHSL from "./adjustHSL.js";
import { getColorModel } from "../utils/color.js";
import { checkContrast } from "../cli/utils/checkContrast.js";

function testGroupDeltaE(colors, index, mode, targetDeltaE = 5.5) {
  const curColor = colors[index];
  for (let i = 0; i < colors.length; i++) {
    if (i !== index) {
      let color2 = colors[i];
      if (color2 !== "----" && curColor !== color2) {
        if (!checkContrast([curColor, color2], mode, targetDeltaE)) {
          return false;
        }
      }
    }
  }
  return true;
}

function isPairInParameter(index1, index2, parameter) {
  if (parameter.length === 0) {
    return false;
  }

  for (const pair of parameter) {
    if (
      (pair[0] === index1 && pair[1] === index2) ||
      (pair[0] === index2 && pair[1] === index1)
    ) {
      return true;
    }
  }
  return false;
}

export default function adjustColorsGroup(
  colors,
  ignoredIndex,
  mode,
  targetDeltaE = 5.5
) {
  let adjustedColors = [...colors];
  let changesMade = true;
  const changedStuff = [];

  while (changesMade) {
    changesMade = false;
    for (let i = 0; i < adjustedColors.length; i++) {
      for (let j = i + 1; j < adjustedColors.length; j++) {
        let color1 = adjustedColors[i];
        let color2 = adjustedColors[j];
        if (!isPairInParameter(i, j, ignoredIndex)) {
          let deltaE = chroma.deltaE(color1, color2);

          if (deltaE < targetDeltaE) {
            const format = getColorModel(color2);
            let result;
            if (format === "hsl") {
              result = adjustHSL(color1, color2, mode, targetDeltaE);
            } else {
              result = adjustRGB(color1, color2, mode, targetDeltaE);
            }

            let madeIt = false;
            let madeColor;
            const keys = Object.keys(result);

            for (let l = 0; l < keys.length; l++) {
              if (result[keys[l]] !== "----") {
                const copy = adjustedColors;
                copy[j] = result[keys[l]];
                if (testGroupDeltaE(copy, j, mode, targetDeltaE)) {
                  madeIt = true;
                  madeColor = result[keys[l]];
                  changedStuff.push([j, color2, madeColor, result]);
                  break;
                }
              }
            }

            if (!madeIt) {
              changedStuff.push([j, color2, 'no advised color available', result]);
            }

            changesMade = true;
          }
        }
      }
    }
  }
  return changedStuff;
}
