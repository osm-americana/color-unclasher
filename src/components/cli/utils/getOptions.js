import inquirer from "inquirer";

export default async function getOptions() {
  const defaultOptions = {
    targetDeltaE: 5.5,
    minMaxZoom: [0, 22],
    ignorePairsFile: null,
  };

  const questions = [
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
      name: "ignorePairsFile",
      message: "Enter the file containing non-compliant pairs to ignore:",
      default: defaultOptions.ignorePairsFile,
    },
  ];

  const read = new Promise((resolve, reject) => {
      inquirer.prompt(questions)
      .then((answers) => {
        resolve({
          ...defaultOptions,
          ...answers,
        });
      });
  });

  return read;
}
