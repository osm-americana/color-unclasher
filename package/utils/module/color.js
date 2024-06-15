import Color from "color";
import tinycolor from "tinycolor2";

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
