# Color-Unclasher

Color-Unclasher is designed to help developers making their Maplibre style specifications more accessible to users with color blindness. This tool analyzes color combinations within a style specification and reports any non-compliant pairs. 

The result could be in human readable format (written to terminal or a file) or just data structures exported to another file. 

The exported file for non-compliant pairs in a specific data structure could be used to specify pairs to ignore in future analyses, by providing its filename when prompted "Enter file path for non-compliant pairs to ignore" in terminal.

# Recommendation

Install extensions that would show colors specified in your document. For example, Color Highlight in VS Code.

# Example Workflow
1.  **Run Analysis In Terminal with the Optional Flag --export-pairs-path Followed By a File Path**: Result in human readable format could be written to an optional file path (result.json in this example). If the path is not specified, the result will be written to terminal. Another file (output.txt in this example) could be created for non-compliant pairs stored in a specific data structure.

```sh
color-unclasher styles.json result.txt --export-pairs-path output.json
```

Then answer the questions:
```sh
? Enter the minimum DeltaE for enough difference: 5.5
? Enter the minimum and maximum zoom level (comma-separated): 0,22
? Enter file path for non-compliant pairs to ignore: 
```

Whats written to result.txt

![The non-compliant pairs with their IDs and color at a particular zoom level, organized by type=fill or type=line, and types of color blindness](.github/r1.png)

Whats written to output.json

```js
{
  "normal": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {
      "17": [[["bus"], ["bike"]]]
    }
  },
  "deuteranopia": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {
      "16": [[["bus"], ["bike"]]]
    }
  },
  "protanopia": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {
      "16": [[["bus"], ["bike"]]]
    }
  },
  "tritanopia": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {
      "11": [[["bus"], ["bike"]]]
    }
  }
}
```

2. **Edit output.json To Specify Pairs To Ignore In Future Analyzes**: Let's say I am not worried about "airport" and "grass" having similar colors, then I would **leave** pairs with "airport" and "grass" in output.json, and delete the rest. output.json should now look like:

```js
{
  "normal": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {}
  },
  "deuteranopia": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {}
  },
  "protanopia": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {}
  },
  "tritanopia": {
    "fill": {
      "6": [[["airport"], ["grass"]]]
    },
    "line": {}
  }
}
```

3. **Analyze Again And Feed output.json Back In When Prompted**: run

```sh
color-unclasher style.json result.txt
```
Then in the third question, provide the path to output.json
```sh
? Enter the minimum DeltaE for enough difference: 5.5
? Enter the minimum and maximum zoom level (comma-separated): 0,22
? Enter file path for non-compliant pairs to ignore: output.json
```

Then the result written to result.txt would no longer have the pairs configured to ignore

![The result is a lot shorter than before](.github/r2.png)

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
