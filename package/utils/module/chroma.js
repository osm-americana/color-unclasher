import chroma from "chroma-js";

// TODO: need testing
export function returnColorInTargetFormat(color, format) {
  switch (format) {
    case "hex":
      return chroma(color);
    case "rgb":
      return chroma(color).rgb();
    case "hsl":
      return chroma(color).hsl();
    case "hsv":
      return chroma(color).hsv();
    case "gl":
      return chroma(color).gl();
    case "lab":
      return chroma(color).lab();
    case "hsla":
      return chroma(color).hsla();
    case "cmyk":
      return chroma(color).cmyk();
    default:
      console.error("Unsupported color simulation");
      process.exit(1);
    }
}
