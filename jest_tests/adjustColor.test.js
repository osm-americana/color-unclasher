import adjustColor from "../src/components/module/adjustColor";

test("adjust simple colors w/ adjustRGB", () => {
  const colors = [
    "hsl(30, 44%, 96%)",
    "hsl(0, 0%, 75%)",
    "#FFDD00",
    "#FFDDDD",
    "rgba(133,192,249,0.5)",
    "hsl(211, 60%, 85%)",
    "#bababa",
  ];

  expect(adjustColor(colors, [], "normal", 5.5)).toStrictEqual([
    [
      6,
      "#bababa",
      "#c6baba",
      {
        blue_decrease: "#babaaf",
        blue_increase: "#babac5",
        green_decrease: "#bab3ba",
        green_increase: "#bac2ba",
        red_decrease: "#afbaba",
        red_increase: "#c6baba",
      },
    ],
  ]);
});

test("adjust simple colors w/ adjustHSL", () => {
  const colors = [
    "hsl(30, 44%, 96%)",
    "hsl(0, 0%, 75%)",
    "hsl(211, 60%, 85%)",
    "#FFDD00",
    "#FFDDDD",
    "rgba(133,192,249,0.5)",
    "hsl(211, 50%, 85%)",
  ];

  expect(adjustColor(colors, [], "normal", 5.5)).toStrictEqual([
    [
      6,
      "hsl(211, 50%, 85%)",
      "hsl(199, 50%, 85%)",
      {
        hue_decrease: "hsl(199, 50%, 85%)",
        hue_increase: "----",
        lightness_decrease: "hsl(211, 50%, 77%)",
        lightness_increase: "hsl(211, 50%, 91%)",
        saturation_decrease: "hsl(211, 25%, 85%)",
        saturation_increase: "----",
      },
    ],
  ]);
});

test("adjust simple colors with ignored pairs 1", () => {
  const colors = [
    "hsl(30, 44%, 96%)",
    "hsl(0, 0%, 75%)",
    "#FFDD00",
    "#FFDD10",
    "hsl(211, 50%, 80%)",
    "hsl(211, 50%, 85%)",
    "hsl(211, 60%, 85%)",
    "hsl(0, 0%, 23%)",
  ];

  expect(adjustColor(colors, [[2, 3]], "normal", 5.5)).toStrictEqual([
    [
      5,
      "hsl(211, 50%, 85%)",
      "hsl(205, 50%, 85%)",
      {
        hue_decrease: "hsl(205, 50%, 85%)",
        hue_increase: "----",
        lightness_decrease: "hsl(211, 50%, 73%)",
        lightness_increase: "hsl(211, 50%, 87%)",
        saturation_decrease: "hsl(211, 38%, 85%)",
        saturation_increase: "----",
      },
    ],
    [
      6,
      "hsl(211, 60%, 85%)",
      "hsl(205, 60%, 85%)",
      {
        hue_decrease: "hsl(205, 60%, 85%)",
        hue_increase: "----",
        lightness_decrease: "hsl(211, 60%, 74%)",
        lightness_increase: "hsl(211, 60%, 88%)",
        saturation_decrease: "hsl(211, 38%, 85%)",
        saturation_increase: "----",
      },
    ],
    [
      6,
      "hsl(205, 60%, 85%)",
      "hsl(193, 60%, 85%)",
      {
        hue_decrease: "hsl(193, 60%, 85%)",
        hue_increase: "----",
        lightness_decrease: "hsl(205, 60%, 79%)",
        lightness_increase: "hsl(205, 60%, 93%)",
        saturation_decrease: "hsl(205, 17%, 85%)",
        saturation_increase: "hsl(205, 94%, 85%)",
      },
    ],
  ]);
});

test("adjust simple colors with ignored pairs 2", () => {
  const colors = [
    "hsl(30, 44%, 96%)",
    "hsl(0, 0%, 75%)",
    "#FFDD00",
    "#FFDDDD",
    "#94c4f0",
    "#6785a3",
    "hsl(211, 60%, 85%)",
    "hsl(211, 50%, 85%)",
    "#adadad",
  ];

  expect(
    adjustColor(
      colors,
      [
        [1, 8],
        [2, 3],
      ],
      "normal",
      5.5
    )
  ).toStrictEqual([
    [
      7,
      "hsl(211, 50%, 85%)",
      "hsl(199, 50%, 85%)",
      {
        hue_decrease: "hsl(199, 50%, 85%)",
        hue_increase: "----",
        lightness_decrease: "hsl(211, 50%, 77%)",
        lightness_increase: "hsl(211, 50%, 91%)",
        saturation_decrease: "hsl(211, 25%, 85%)",
        saturation_increase: "----",
      }
    ]
  ]);
});
