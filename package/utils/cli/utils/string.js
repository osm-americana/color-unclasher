export function checkStringsExist(data, string1, string2) {
  return data.some((innerArray) => {
    const flatInnerArray = innerArray.flat(); // Flatten the inner array
    return flatInnerArray.includes(string1) && flatInnerArray.includes(string2);
  });
}
