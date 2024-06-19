import fs from "fs";

/*
Output:
At index 0: all layers with type=fill
At index 1: all layers with type=line

[
  {
    landuse: [
      { id: 'landuse_school', paint: [Object] },
      { id: 'landuse_hospital', paint: [Object] }
    ],
  },
  { 
    transportation: [
      { id: 'landuse_school', paint: [Object] },
      { id: 'landuse_hospital', paint: [Object] }
    ], 
  }
]
*/
export default function extractStyle(filename) {
  return new Promise((resolve, reject) => {
    const fillData = {};
    const lineData = {};

    fs.readFile(filename, "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      const jsonData = JSON.parse(data);

      jsonData.layers.forEach((layer) => {
        const sourceLayer = layer["source-layer"] || "background";
        if (
          layer["type"] !== "fill" &&
          layer["type"] !== "background" &&
          layer["type"] !== "line"
        ) {
          return;
        }

        if (layer.type === "fill") {
          parseLayer(
            layer,
            "fill-color",
            ["fill-color", "background-color"],
            fillData,
            sourceLayer
          );
        } else if (layer.type === "line") {
          parseLayer(
            layer,
            "line-color",
            ["line-color"],
            lineData,
            sourceLayer
          );
        }
      });

      resolve([fillData, lineData]);
    });
  });
}

function parseLayer(layer, paintType, targetProperties, result, sourceLayer) {
  const layerId = layer.id;
  const paint = {};
  let minZoom;
  let maxZoom;

  if (layer.paint) {
    if (layer.paint[paintType]) {
      paint[paintType] = layer.paint[paintType];
    }
  }

  if (layer.minzoom) {
    minZoom = layer.minzoom;
  }

  if (layer.maxzoom) {
    maxZoom = layer.maxzoom;
  }

  if (layer.paint) {
    targetProperties.forEach((prop) => {
      if (layer.paint[prop]) {
        paint[prop] = layer.paint[prop];
        // TODO temporary fix.
        if (prop === "background-color") {
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
  if (result[sourceLayer]) {
    result[sourceLayer].push(data);
  } else {
    result[sourceLayer] = [data];
  }
}
