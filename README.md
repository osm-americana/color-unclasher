# Color-Unclasher

Color-blind friendliness checker for Maplibre

# Recommendation

Install extentions that would show colors specified in your document. For example, Color Highlight in VS Code.

# Check via terminal

```sh
color-unclasher filePath [outPutPath] // result would be written to terminal when no outPutPath is provided
```

Then answer the questions:

? Enter the minimum DeltaE for enough difference: 5.5

? Enter the minimum and maximum zoom level (comma-separated): 0,22

? Enter file path for pairs to ignore: 

--------

Optional flag:
```sh
--export-pairs-to-path outPutPath
```
Export non-compliant pairs as JSON. Modify the output file for the input file for pairs to ignore during analyzing.

Example exported file:
```json
{
  "normal": {
    "fill": {},
    "line": {}
  },
  "deuteranopia": {
    "fill": {},
    "line": {}
  },
  "protanopia": {
    "fill": {
      "0": [[["background"], ["landuse_hospital"]]],
      "1": [[["background"], ["landuse_hospital"]]],
      "2": [[["background"], ["landuse_hospital"]]]
    },
    "line": {}
  },
  "tritanopia": {
    "fill": {},
    "line": {}
  }
}
```

# Get adjusted colors via module

```js
import ColorUnclasher from "color-unclasher";

const color1 = "#a4a95b"; // wouldn't be modified
const color2 = "#ff8375"; // be based on by adjusted colors 

/*
  Result:
  {
    red_increase: '----', // means no possible result
    red_decrease: '#da8375',
    green_increase: '#ffa875',
    green_decrease: '#ff5e75',
    blue_increase: '#ff8387',
    blue_decrease: '#ff833a'
  }
*/
const newColors = ColorUnclasher.adjustRGB(color1, color2, deuteranopia);
```
