import chroma from "chroma-js";
import Color from "color";
import tinycolor from "tinycolor2";

// TODO: need testing
export function returnColorInTargetFormat(color, format) {

  switch (format) {
    case "hex":
      return chroma(color).hex();
    case "rgb":
      return Color.rgb(color).string();
    case "hsl":
      return Color.rgb(color).hsl().string();
    case "hsla":
      return Color.rgb(color).hsla().string();
    case "hsv":
      return Color.rgb(color).hsv(color).string();
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
