// import tinycolor from "tinycolor2";
import {getColorModel} from "./color.js";

test("correctly get color model name", () => {
  const colors = [
    ["hsl(30, 44%, 96%)","hsl"],
    ["hsla(0, 100%, 50%, .5)", "hsla"],
    ["#FFFFFF", 'hex'],
    ["#ff000080", 'hex8'],
    ["rgb(255, 255, 255)", 'rgb'],
    ["rgba(255, 0, 0, .5)", 'rgba'],
    ["hsv(0, 100, 100%)", 'hsv'],
    ["hsva(0, 100%, 100%, .5)", 'hsva']
  ];

  colors.map((pair) => {
    expect(getColorModel(pair[0])).toBe(pair[1]);
  });
});
