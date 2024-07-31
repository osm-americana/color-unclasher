import fs from "fs";
import path from "path";

export async function readFile(path) {
  const pairs = new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        throw new Error("Error reading file:", err);
      }

      try {
        const jsonData = JSON.parse(data);
        resolve(jsonData);
      } catch (error) {
        console.log('\nProcess terminated.');
        console.log(`Please check ${path} content format.`);
        throw new Error("Error parsing file into JSON object.", error);
      }
    });
  });

  return pairs;
}

export async function writeFile(outputMessages, outputPath, message) {
  fs.writeFile(path.resolve(outputPath), outputMessages, "utf8", (writeErr) => {
    if (writeErr) {
      console.error("Error writing to output file:", writeErr);
      process.exit(1);
    }
    console.log(message, outputPath);
  });
}

export function isValidStructure(obj, colorBlindModes, layerTypes) {
  function isArrayOfArraysOfArrays(item) {
    if (!Array.isArray(item)) return false;
    return item.every((subArray1) => {
      return (
        Array.isArray(subArray1) &&
        Array.isArray(subArray1[0]) &&
        Array.isArray(subArray1[1])
      );
    });
  }

  let hasAtLeastOneField = false;

  // Check if the object has at least one of the required top-level fields
  for (const field of colorBlindModes) {
    if (obj.hasOwnProperty(field)) {
      hasAtLeastOneField = true;

      // Each present top-level field must be an object containing 'fill' and 'line'
      const subObject = obj[field];
      if (typeof subObject !== "object" || subObject === null) {
        throw new Error(
          `For type ${field}, must contain "fill" and "line" fields`
        );
      }

      for (const innerField of layerTypes) {
        if (subObject.hasOwnProperty(innerField)) {
          const innerSubObject = subObject[innerField];
          if (typeof innerSubObject !== "object" || innerSubObject === null)
            return false;

          for (const key in innerSubObject) {
            const isNumberOrString =
              typeof key === "number" ||
              (typeof key === "string" && !isNaN(key));

            if (!isNumberOrString) {
              throw new Error(
                `For type ${field} and type=${innerField}, the zoom level ${key} isn't a number`
              );
            }

            if (innerSubObject.hasOwnProperty(key)) {
              if (!isArrayOfArraysOfArrays(innerSubObject[key])) return false;
            }
          }
        }
      }
    }
  }

  // If no required top-level field is present
  if (!hasAtLeastOneField) {
    throw new Error(
      "Must contain at least one of 'normal', 'deuteranopia', 'protanopia', or 'tritanopia' field."
    );
  }

  return true;
}
