import { checkPairExist } from "./string";

test("return true", () => {
  const data = [[["line2"], ["line1"]]];
  const string1 = "line1";
  const string2 = "line2";

  expect(checkPairExist(data, string1, string2)).toBe(true);
});

test("return true complicated case1", () => {
  const data = [[["line2"], [["road", "==,get,intermittent,1"]]]];
  const string1 = "line2";
  const string2 = ["road", "==,get,intermittent,1"];

  expect(checkPairExist(data, string1, string2)).toBe(true);
});

test("return true complicated case2", () => {
  const data = [[["line2"], ["road", "==,get,intermittent,1"]]];
  const string1 = "line2";
  const string2 = ["road", "==,get,intermittent,1"];

  expect(checkPairExist(data, string1, string2)).toBe(true);
});
