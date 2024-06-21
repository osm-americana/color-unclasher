import { getZoomLevelColorsArray } from "./processStyles";

test("correctly get fill colors", () => {
  const data = {
    aeroway: [{ id: "airport", paint: { "fill-color": "hsl(0, 0%, 75%)" } }],
  };

  expect(getZoomLevelColorsArray(data, [0, 5])).toStrictEqual([
    [
      "airport",
      {
        0: "hsl(0, 0%, 75%)",
        1: "hsl(0, 0%, 75%)",
        2: "hsl(0, 0%, 75%)",
        3: "hsl(0, 0%, 75%)",
        4: "hsl(0, 0%, 75%)",
        5: "hsl(0, 0%, 75%)",
      },
    ],
  ]);
});

test("correctly get stops colors", () => {
  const data = {
    water: [
      {
        id: "ocean",
        paint: {
          "fill-color": {
            stops: [
              [6, "rgba(133,192,249,0.5)"],
              [11, "rgba(15,32,128,1)"],
            ],
          },
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [5, 12])).toStrictEqual([
    [
      "ocean",
      {
        5: "rgba(133,192,249,0.5)",
        6: "rgba(133,192,249,0.5)",
        7: "#426087",
        8: "#3c5a8c",
        9: "#324d8d",
        10: "#233a89",
        11: "rgba(15,32,128,1)",
        12: "rgba(15,32,128,1)",
      },
    ],
  ]);
});

test("correctly get interpolate linear colors", () => {
  const data = {
    transportation: [
      {
        id: "road",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            "rgb(255, 0, 0)",
            10,
            "rgb(0, 255, 0)",
          ],
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [0, 10])).toStrictEqual([
    [
      "road",
      {
        0: "rgb(255, 0, 0)",
        1: "#e61a00",
        2: "#cc3300",
        3: "#b34d00",
        4: "#996600",
        5: "#808000",
        6: "#669900",
        7: "#4db300",
        8: "#33cc00",
        9: "#19e600",
        10: "rgb(0, 255, 0)",
      },
    ],
  ]);
});

test("correctly get interpolate linear colors with multiple steps", () => {
  const data = {
    test: [
      {
        id: "test",
        paint: {
          "fill-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            "rgb(255, 255, 255)",
            5,
            "rgb(255, 0, 0)",
            10,
            "rgb(0, 255, 0)",
            15,
            "rgb(0, 0, 255)",
            20,
            "rgb(0, 0, 0)",
          ],
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [0, 20])).toStrictEqual([
    [
      "test",
      {
        0: "rgb(255, 255, 255)",
        1: "#ffcccc",
        2: "#ff9999",
        3: "#ff6666",
        4: "#ff3333",
        5: "rgb(255, 0, 0)",
        6: "#cc3300",
        7: "#996600",
        8: "#669900",
        9: "#33cc00",
        10: "rgb(0, 255, 0)",
        11: "#00cc33",
        12: "#009966",
        13: "#006699",
        14: "#0033cc",
        15: "rgb(0, 0, 255)",
        16: "#0000cc",
        17: "#000099",
        18: "#000066",
        19: "#000033",
        20: "rgb(0, 0, 0)",
      },
    ],
  ]);
});

test("correctly get interpolate-hcl linear colors", () => {
  const data = {
    test: [
      {
        id: "test",
        paint: {
          "fill-color": [
            "interpolate-hcl",
            ["linear"],
            ["zoom"],
            0,
            "rgb(255, 0, 0)",
            10,
            "rgb(0, 255, 0)",
          ],
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [0, 10])).toStrictEqual([
    [
      "test",
      {
        0: "rgb(255, 0, 0)",
        1: "#fc4300",
        2: "#f66300",
        3: "#ed7d00",
        4: "#e09400",
        5: "#d1a900",
        6: "#bebc00",
        7: "#a8cf00",
        8: "#8ce000",
        9: "#65f000",
        10: "rgb(0, 255, 0)",
      },
    ],
  ]);
});

test("correctly get interpolate exponential with base=1.2 colors", () => {
  const data = {
    transportation: [
      {
        id: "road",
        paint: {
          "fill-color": [
            "interpolate",
            ["exponential", 1.2],
            ["zoom"],
            5,
            "hsl(0, 0%, 75%)",
            10,
            "hsl(0, 0%, 23%)",
          ],
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [4, 11])).toStrictEqual([
    [
      "road",
      {
        4: "hsl(0, 0%, 75%)",
        5: "hsl(0, 0%, 75%)",
        6: "#adadad",
        7: "#989898",
        8: "#7e7e7e",
        9: "#606060",
        10: "hsl(0, 0%, 23%)",
        11: "hsl(0, 0%, 23%)",
      },
    ],
  ]);
});

test("correctly get interpolate exponential with base=2 colors", () => {
  const data = {
    transportation: [
      {
        id: "road",
        paint: {
          "fill-color": [
            "interpolate",
            ["exponential", 2],
            ["zoom"],
            5,
            "hsl(0, 0%, 75%)",
            10,
            "hsl(0, 0%, 23%)",
          ],
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [4, 11])).toStrictEqual([
    [
      "road",
      {
        4: "hsl(0, 0%, 75%)",
        5: "hsl(0, 0%, 75%)",
        6: "#bbbbbb",
        7: "#b2b2b2",
        8: "#a1a1a1",
        9: "#7f7f7f",
        10: "hsl(0, 0%, 23%)",
        11: "hsl(0, 0%, 23%)",
      },
    ],
  ]);
});

test("correctly get case colors", () => {
  const data = {
    transportation: [
      {
        id: "road",
        paint: {
          "fill-color": [
            "case",
            [
              "any",
              ["==", ["get", "intermittent"], 1],
              ["==", ["get", "brunnel"], "tunnel"],
            ],
            "hsl(211, 60%, 85%)",
            "hsl(211, 100%, 30%)",
          ],
        },
      },
    ],
  };

  expect(getZoomLevelColorsArray(data, [4, 6])).toStrictEqual([
    [
      ["road", "==,get,intermittent,1"],
      {
        4: "hsl(211, 60%, 85%)",
        5: "hsl(211, 60%, 85%)",
        6: "hsl(211, 60%, 85%)",
      },
    ],
    [
      ["road", "==,get,brunnel,tunnel"],
      {
        4: "hsl(211, 100%, 30%)",
        5: "hsl(211, 100%, 30%)",
        6: "hsl(211, 100%, 30%)",
      },
    ],
  ]);
});
