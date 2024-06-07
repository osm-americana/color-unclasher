import chroma from "chroma-js";
import colorBlind from "color-blind";

export default function checkContrastBetweenPairs(colorBlindTypes, uniqueColors) {
  const nonCompliantPairsByType = [];

  colorBlindTypes.map((t) => {
    let nonCompliantPairs = {};

    for (const [zoomLevel, colors] of uniqueColors) {
      const result = checkContrast(colors, t, 5.5);
      if (typeof result !== "boolean") {
        nonCompliantPairs[zoomLevel] = result;
      }
    }
    nonCompliantPairsByType.push([t, nonCompliantPairs]);
  });

  return nonCompliantPairsByType;
}

function checkEnoughContrast(color1, color2, mode, threshHold = 5.5) {
  let chromaColor1;
  let chromaColor2;

  switch (mode) {
    case "deuteranopia":
      chromaColor1 = colorBlind.deuteranopia(color1);
      chromaColor2 = colorBlind.deuteranopia(color2);
      break;
    case "protanopia":
      chromaColor1 = colorBlind.protanopia(color1);
      chromaColor2 = colorBlind.protanopia(color2);
      break;
    case "tritanopia":
      chromaColor1 = colorBlind.tritanopia(color1);
      chromaColor2 = colorBlind.tritanopia(color2);
      break;
    case "normal":
      chromaColor1 = color1;
      chromaColor2 = color2;
      break;
    default:
      console.error("Unsupported color simulation");
      process.exit(1);
  }

  if (chroma.deltaE(chromaColor1, chromaColor2) >= threshHold) {
    return true;
  }
  // return true if two rgba colors are exactly the same except 
  // for the alpha channel
  else if (color1.includes("rgba") && color2.includes("rgba")) {
    const color1Split = color1.split(",");
    const color2Split = color2.split(",");
    let pass = true;

    for (let i = 0; i < 3; i++) {
      pass = color1Split[i] == color2Split[i] && pass;
    }

    return pass;
  } else {
    return false;
  }
}

function checkContrast(colors, mode, threshHold) {
  let nonCompliantPairs = [];

  for (let i = 0; i < colors.length; i++) {
    for (let j = i + 1; j < colors.length; j++) {
      if (!checkEnoughContrast(colors[i], colors[j], mode, threshHold)) {
        nonCompliantPairs.push([colors[i], colors[j]]);
      }
    }
  }

  if (nonCompliantPairs.length === 0) {
    return true;
  } else {
    return nonCompliantPairs;
  }
}