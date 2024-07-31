export function checkPairExist(data, string1, string2) {
  // Function to flatten nested arrays
  function flattenDeep(arr) {
    return arr.reduce(
      (acc, val) =>
        Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val),
      []
    );
  }

  // Flatten the inner arrays of data
  const flattenedData = flattenDeep(data);

  // Function to check if a value (string or array of strings) exists in flattenedData
  function includesValue(value) {
    if (Array.isArray(value)) {
      return value.every((s) => flattenedData.includes(s));
    } else {
      return flattenedData.includes(value);
    }
  }

  // Check if string1 or string2 exists in flattenedData
  const includesString1 = includesValue(string1);
  const includesString2 = includesValue(string2);

  // Return true if either string1 or string2 is found in flattenedData
  return includesString1 || includesString2;
}
