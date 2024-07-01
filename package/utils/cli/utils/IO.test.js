import { isValidStructure } from "./IO";

const colorBlindTypes = ["normal", "deuteranopia", "protanopia", "tritanopia"];
const layerTypes = ["fill", "line"];

test("pass valid structure", () => {
  const object = {
  "normal": {
    "fill": {
      "6": [[["airport"], ["grass"]]],
      "7": [[["airport"], ["grass"]]],
      "8": [[["airport"], ["grass"]]]
    },
    "line": {}
  },
  "deuteranopia": {},
  "protanopia": {
    "fill": {},
    "line": {}
  },
  "tritanopia": {
    "fill": {},
    "line": {}
  }
}

    expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(true);
});

test("pass valid structure", () => {
  const object = {
    normal: {
      fill: {
        6: [[["airport"], ["grass"]]],
        7: [[["airport"], ["grass"]]],
        8: [[["airport"], ["grass"]]],
      }
    }
  };

  expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(true);
});

test("pass valid structure", () => {
  const object = {
    normal: {
      fill: {},
    },
  };

  expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(true);
});

test("fail invalid structure", () => {
  const object = {
    normal: {
      fill: {
        6: [[["grass"]]],
      },
      line: {},
    },
  };

  expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(false);
});

test("fail invalid structure", () => {
  const object = {
    normal: {
      fill: {
        6: [["airport"], ["grass"]]
      },
      line: {},
    },
  };

  expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(false);
});

test("fail invalid structure", () => {
  const object = {
    normal: {
      fill: [
        [["string1"], ["string2"]],
        [["string3"], ["string4"]],
      ],
      line: [
        [["string5"], ["string6"]],
        [["string7"], ["string8"]],
      ],
    },
    deuteranopia: {
      fill: [
        [["string9"], ["string10"]],
        [["string11"], ["string12"]],
      ],
      line: [
        [["string13"], ["string14"]],
        [["string15"], ["string16"]],
      ],
    },
  };

  expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(false);
});

// test("fail invalid structure", () => {
//   const object = {
//     normal: {
//       fill: {
//         6: [[[1], ["grass"]]],
//       },
//       line: {},
//     }
//   };

//   expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(false);
// });

test("fail invalid structure", () => {
  const object = {
    normal: {
      fill: {
        'lll': [[['11'], ["grass"]]],
      },
      line: {},
    },
  };

  expect(isValidStructure(object, colorBlindTypes, layerTypes)).toBe(false);
});
