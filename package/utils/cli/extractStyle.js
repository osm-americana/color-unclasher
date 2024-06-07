import fs from "fs";

/*
Output:
{
  landuse: [
    { id: 'landuse_school', paint: [Object] },
    { id: 'landuse_hospital', paint: [Object] }
  ],
  vegetation: [
    { id: 'bush', paint: [Object] },
    { id: 'tree', paint: [Object] }
  ]
}
*/
export default function extractStyle(filename) {
  return new Promise((resolve, reject) => {
    const groupedData = {};

    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const jsonData = JSON.parse(data);

      jsonData.layers.forEach((layer) => {
        const sourceLayer = layer["source-layer"] || 'background';
        if (layer["type"] !== "fill" && layer["type"] !== "background") {
          return;
        }
        const layerId = layer.id;
        const paint = {};
        let minZoom;
        let maxZoom;

        if (layer.paint) {
          if (layer.paint["fill-color"]) {
            paint["fill-color"] = layer.paint["fill-color"];
          }
        }

        if (layer.minzoom) {
          minZoom = layer.minzoom;
        }

        if (layer.maxzoom) {
          maxZoom = layer.maxzoom;
        }

        const targetProperties = [
          "fill-color",
          // "outline-color",
          // "line-color",
          // "fill-outline-color",
          // "heatmap-color",
          // "text-color",
          "background-color",
        ];

        if (layer.paint) {
          targetProperties.forEach((prop) => {
            if (layer.paint[prop]) {
              paint[prop] = layer.paint[prop];
              // TODO temporary fix.
              if (prop === 'background-color') {
                paint["fill-color"] = layer.paint[prop];
              }
            }
          });
        }

        const data = { id: layerId, paint };
        if (minZoom) {
          data["minZoom"] = minZoom;
        }
        if (maxZoom) {
          data["maxZoom"] = maxZoom;
        }

        // group by source layer
        if (groupedData[sourceLayer]) {
          groupedData[sourceLayer].push(data);
        } else {
          groupedData[sourceLayer] = [data];
        }
      });

      resolve(groupedData);

      // // Prepare the output string
      // let output = "";
      // for (const sourceLayer in groupedData) {
      //   output += `Source Layer: ${sourceLayer}\n`;
      //   groupedData[sourceLayer].forEach(({ id, paint }) => {
      //     output += `ID: ${id}\n`;
      //     output += `Paint: ${JSON.stringify(paint, null, 2)}\n`;
      //   });
      //   output += "\n";
      // }

      // // Write the output to a file
      // fs.writeFile("output2.txt", output, "utf8", (err) => {
      //   if (err) {
      //     console.error("Error writing to file:", err);
      //     return;
      //   }
      //   console.log("Output saved to output.txt");
      // });
    });

    // fs.readFile(filename, 'utf8', (err, data) => {
    //   if (err) {
    //     reject(err);
    //     return;
    //   }

    //   try {
    //     const jsonData = JSON.parse(data);
    //     resolve(jsonData);
    //   } catch (parseError) {
    //     reject(parseError);
    //   }
    // });
  });
}

// export default function extractStyle() {
//   const groupedData = {};

//   readJsonFile("../hmm.json")
//     .then((data) => {
//       console.log('---');
//       return data;
//     })
//     .catch((error) => {
//       console.error("Error reading file:", error);
//     });

//   // Read the JSON file
//   // fs.readFile("../hmm.json", "utf8", (err, data) => {
//   //   if (err) {
//   //     console.error("Error reading file:", err);
//   //     return;
//   //   }

//   //   // Parse the JSON data
//   //   const jsonData = JSON.parse(data);

//   //   // Iterate through the elements in the 'layers' field
//   //   jsonData.layers.forEach((layer) => {
//   //     const sourceLayer = layer["source-layer"];
//   //     if (layer["type"] !== "fill") {
//   //       return;
//   //     }
//   //     const layerId = layer.id;
//   //     // const colors = [];
//   //     const paint = {};
//   //     // const paint = layer.paint;
//   //     // let paint;

//   //     if (layer.paint) {
//   //       if (layer.paint["fill-color"]) {
//   //         paint["fill-color"] = layer.paint["fill-color"];
//   //       }
//   //     }

//   //     // distinguishFillColor(paint);

//   //     const targetProperties = [
//   //       "fill-color",
//   //       // "outline-color",
//   //       // "line-color",
//   //       // "fill-outline-color",
//   //       // "heatmap-color",
//   //       // "text-color",
//   //       "background-color",
//   //     ];

//   //     if (layer.paint) {
//   //       targetProperties.forEach((prop) => {
//   //         if (layer.paint[prop]) {
//   //           paint[prop] = layer.paint[prop];
//   //         }
//   //       });
//   //     }

//   //     // Check if 'source-layer' is already a key in the object
//   //     if (groupedData[sourceLayer]) {
//   //       // If so, append the 'id' and 'paint' to the array of data for that 'source-layer'
//   //       groupedData[sourceLayer].push({ id: layerId, paint });
//   //     } else {
//   //       // If not, create a new entry with 'source-layer' as key and an array containing 'id' and 'paint' as the first element
//   //       groupedData[sourceLayer] = [{ id: layerId, paint }];
//   //     }
//   //   });

//   //   // // Prepare the output string
//   //   // let output = "";
//   //   // for (const sourceLayer in groupedData) {
//   //   //   output += `Source Layer: ${sourceLayer}\n`;
//   //   //   groupedData[sourceLayer].forEach(({ id, paint }) => {
//   //   //     output += `ID: ${id}\n`;
//   //   //     output += `Paint: ${JSON.stringify(paint, null, 2)}\n`;
//   //   //   });
//   //   //   output += "\n";
//   //   // }

//   //   // // Write the output to a file
//   //   // fs.writeFile("output2.txt", output, "utf8", (err) => {
//   //   //   if (err) {
//   //   //     console.error("Error writing to file:", err);
//   //   //     return;
//   //   //   }
//   //   //   console.log("Output saved to output.txt");
//   //   // });
//   // });

//   // return groupedData;
// }
