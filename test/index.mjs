import {
  createFunction,
} from "@maplibre/maplibre-gl-style-spec";

// const lol = new Interpolate(outputType, (operator as any), interpolation as InterpolationType, input as Expression, stops);
          5, "#ff0000", 10, "#00ff00", 15, "#0000ff";


        const f = createFunction(
          {
            type: "exponential",
            stops: [
              [5, "#ff0000"],
              [10, "#00ff00"],
              [15, "#0000ff"],
            ],
          },
          {
            type: "color",
          }
        ).evaluate;

        console.log(f({ zoom: 0 }));
        console.log(f({ zoom: 14 }));

                const l = createFunction(
                  {
                    type: "linear",
                    stops: [
                      [5, "#ff0000"],
                      [10, "#00ff00"],
                      [15, "#0000ff"],
                    ],
                  },
                  {
                    type: "color",
                  }
                ).evaluate;

        // expectToMatchColor(f({ zoom: 0 }, undefined), "rgb(100% 0% 0% / 1)");