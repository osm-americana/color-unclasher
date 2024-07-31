import {
  interpolates,
  Color,
  createFunction,
  Interpolate,
} from "@maplibre/maplibre-gl-style-spec";
import tinycolor from "tinycolor2";

test("these two implementations reaches the same result", () => {
  const t = Interpolate.interpolationFactor(
    {
      name: "exponential",
      base: 1.2,
    },
    6,
    5,
    10
  );

  const interpolatedResult = interpolates.color(
    Color.parse("#ff0000"),
    Color.parse("#00ff00"),
    t
  );

  const interpolatedColor = tinycolor({
    r: interpolatedResult.r * 255,
    g: interpolatedResult.g * 255,
    b: interpolatedResult.b * 255,
  }).toHexString();

  const f2 = createFunction(
    {
      type: "exponential",
      stops: [
        [5, "#ff0000"],
        [10, "#00ff00"],
        [15, "#0000ff"],
      ],
      base: 1.2,
    },
    {
      type: "color",
    }
  ).evaluate;

  const color2 = f2({ zoom: 6 });
  expect(
    tinycolor({
      r: color2.r * 255,
      g: color2.g * 255,
      b: color2.b * 255,
    }).toHexString()
  ).toBe(interpolatedColor);
});
