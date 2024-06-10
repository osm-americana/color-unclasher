import colorUnClasher from "color-unclasher";

console.log(
  colorUnClasher.adjustRGB(
    "hsl(30, 44%, 96%)",
    "hsl(250, 41%, 95%)",
    "tritanopia"
  )
);

console.log(colorUnClasher.adjustRGB("#F9F5F0", "#F2F0F9", "tritanopia"));

console.log(colorUnClasher.adjustRGB("#a4a95b", "#ff8375", "deuteranopia"));

console.log(
  colorUnClasher.adjustRGB(
    "rgb(255, 131, 116)",
    "rgb(164, 169, 91)",
    "deuteranopia"
  )
);