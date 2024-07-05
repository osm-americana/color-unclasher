import {
  Interpolate,
  interpolates,
  Color,
} from "@maplibre/maplibre-gl-style-spec";
import tinycolor from "tinycolor2";
import chroma from "chroma-js";

// TODO: need testing
export function convertToTargetFormat(adjustedColor, color2) {
  var color = tinycolor(adjustedColor);
  const format = getColorModel(color2);

  switch (format) {
    case "hex":
      return color.toHexString();
    case "rgb":
      return color.toRgbString();
    case "rgba":
      return color.setAlpha(tinycolor(color2).getAlpha()).toRgbString();
    case "hsl":
      return color.toHslString();
    case "hsla":
      return color.setAlpha(tinycolor(color2).getAlpha()).toHslString();
    // case "hsv":
    //   return Color.rgb(color).hsv(color).string();
    // case "gl":
    //   return chroma(color).gl();
    // case "lab":
    //   return chroma(color).lab();
    // case "cmyk":
    //   return chroma(color).cmyk();
    default:
      console.error("Unsupported color format", format);
      process.exit(1);
  }
}

export function getColorModel(color) {
  const name = tinycolor(color).getFormat();
  if (name === "hsl" && color.includes("hsla")) {
    return "hsla";
  }
  if (name === "rgb" && color.includes("rgba")) {
    return "rgba";
  }
  if (name === "hsv" && color.includes("hsva")) {
    return "hsva";
  }

  return name;
}

export function parseHSL(hslString) {
  const hslRegex =
    /hsla?\(\s*([\d.]+)(deg|rad|turn)?\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+)\s*)?\)/i;

  const match = hslString.match(hslRegex);

  if (!match) {
    throw new Error("Invalid HSL(A) string");
  }

  let [, hue, unit, saturation, lightness, alpha] = match;

  switch (unit) {
    case "rad":
      hue = (parseFloat(hue) * (180 / Math.PI)).toFixed(2); // Convert radians to degrees
      break;
    case "turn":
      hue = (parseFloat(hue) * 360).toFixed(2); // Convert turns to degrees
      break;
    case "deg":
    default:
      hue = parseFloat(hue);
  }

  return {
    hue: parseFloat(hue),
    saturation: parseFloat(saturation),
    lightness: parseFloat(lightness),
    alpha: alpha !== undefined ? parseFloat(alpha) : 1, // Default to 1 if alpha is not specified
  };
}

export function getInterpolatedColor(
  value,
  lowerValue,
  higherValue,
  interpolationType,
  interpolationColorSpace,
  color1,
  color2
) {
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

  return chroma(color.r * 255, color.g * 255, color.b * 255).hex();
}
