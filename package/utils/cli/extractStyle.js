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
    });
  });
}
