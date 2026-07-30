import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";

const renameSync = fs.renameSync;

fs.renameSync = (source, destination) => {
  if (String(source).includes(".operations-pack.tmp-")) {
    const error = new Error("injected atomic rename failure");
    error.code = "EIO";
    throw error;
  }

  return renameSync(source, destination);
};

syncBuiltinESMExports();
