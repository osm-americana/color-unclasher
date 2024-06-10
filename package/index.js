#!/usr/bin/env node

import commandLine from "./utils/cli/commandLine.js";
import distinguishHex from "./utils/module/getDarker.js";
import adjustRGB from "./utils/module/adjustRGB";

import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { createRequire } from "module";

const currentDir = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const entryScript = require.resolve(process.argv[1]);

if (currentDir === dirname(entryScript)) {
  commandLine(process);
} 

export default {
  distinguishHex,
  adjustRGB,
};
