import { getColorModel } from "./color.js";
import adjustRGB from "./adjustRGB.js";
import tinycolor from "tinycolor2";
import chroma from "chroma-js";
import colorBlind from "color-blind";

test("correctly get color model name", () => {
  const colors = [
    ["hsl(30, 44%, 96%)", "hsl"],
    ["hsla(0, 100%, 50%, .5)", "hsla"],
    ["#FFFFFF", "hex"],
    ["#ff000080", "hex8"],
    ["rgb(255, 255, 255)", "rgb"],
    ["rgba(255, 0, 0, .5)", "rgba"],
    ["hsv(0, 100, 100%)", "hsv"],
    ["hsva(0, 100%, 100%, .5)", "hsva"],
  ];

  colors.map((pair) => {
    expect(getColorModel(pair[0])).toBe(pair[1]);
  });
});

test("return in hex with more than deltaE of 7", () => {
  const color1 = "#a4a95b";
  const color2 = "#ff8375";
  const color1Blind = colorBlind.deuteranopia(color1);

  const results = adjustRGB(color1, color2, "deuteranopia");

  Object.keys(results).map((key) => {
    if (results[key] !== "----") {
      const color2Blind = colorBlind.deuteranopia(results[key]);
      expect(chroma.deltaE(color1Blind, color2Blind)).toBeGreaterThan(7);
    }
  });
});

test("return in rgb with more than deltaE of 7", () => {
  const color1 = "rgb(255, 131, 116)";
  const color2 = "rgb(164, 169, 91)";
  const color1Blind = colorBlind.deuteranopia(color1);

  const results = adjustRGB(color1, color2, "deuteranopia");

  Object.keys(results).map((key) => {
    if (results[key] !== "----") {
      const color2Blind = colorBlind.deuteranopia(results[key]);
      expect(chroma.deltaE(color1Blind, color2Blind)).toBeGreaterThan(7);
    }
  });
});

test("return in rgba with correct alpha value and more than deltaE of 7", () => {
  const color1 = "rgba(255, 131, 116, 0.5)";
  const color2 = "rgba(164, 169, 91, 0.5)";
  const alpha = tinycolor(color2).getAlpha() + "";
  const color1Blind = colorBlind.deuteranopia(color1);

  const results = adjustRGB(color1, color2, "deuteranopia");

  Object.keys(results).map((key) => {
    if (results[key] !== "----") {
      expect(results[key]).toEqual(expect.stringContaining(alpha));

      const color2Blind = colorBlind.deuteranopia(results[key]);
      expect(chroma.deltaE(color1Blind, color2Blind)).toBeGreaterThan(7);
    }
  });
});

// test("return in hsla with correct alpha value", () => {
//   const color1 = "hsla(0, 100%, 50%, .5)";
//   const color2 = "hsla(0, 100%, 50%, .3)";
//   const alpha = tinycolor(color2).getAlpha() + "";

//   const results = adjustRGB(color1, color2, "deuteranopia");

//   Object.keys(results).map((key) => {
//     if (results[key] !== "----") {
//       expect(results[key]).toEqual(expect.stringContaining(alpha));
//     }
//   });
// });
