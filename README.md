# Color-Unclasher

Color-blind friendliness checker for Maplibre

# Usage

Check via terminal

```sh
color-unclasher filePath [outPutPath] // result would be written to terminal when no outPutPath is provided
```
Then answer the questions:

? Enter the minimum DeltaE for enough difference: 5.5

? Enter the minimum and maximum zoom level (comma-separated): 0,22

--------

Get adjusted colors via module

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
