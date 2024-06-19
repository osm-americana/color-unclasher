import inquirer from "inquirer";

export default async function getOptions(filePath) {
  const defaultOptions = {
    outputPath: '',
    targetDeltaE: 5.5,
    minMaxZoom: [0, 22],
    ignorePairs: [],
  };

  const questions = [
    {
      type: "input",
      name: "outputPath",
      message:
        "Enter the output file location. Keep blank for write to terminal:",
      default: defaultOptions.outputPath,
      filter: (input) => (input === "" ? null : input),
    },
    {
      type: "number",
      name: "targetDeltaE",
      message: "Enter the minimum DeltaE for enough difference:",
      default: defaultOptions.targetDeltaE,
    },
    {
      type: "input",
      name: "minMaxZoom",
      message: "Enter the minimum and maximum zoom level (comma-separated):",
      default: defaultOptions.minMaxZoom,
      filter: (input) =>
        input !== defaultOptions.minMaxZoom
          ? input.split(",").map((pair) => pair.trim())
          : defaultOptions.minMaxZoom,
    },
    {
      type: "input",
      name: "ignorePairs",
      message: "Enter pairs to ignore (comma-separated):",
      filter: (input) =>
        input
          ? input.split(",").map((pair) => pair.trim())
          : defaultOptions.ignorePairs,
    },
  ];

  const read = new Promise((resolve, reject) => {
      inquirer.prompt(questions)
      .then((answers) => {
        resolve({
          filePath,
          ...defaultOptions,
          ...answers,
        });
      });
  });

  return read;
}
