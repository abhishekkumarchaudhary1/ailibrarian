const fs = require("fs");
const path = require("path");

const nativeSwc = path.join(
  __dirname,
  "..",
  "node_modules",
  "@next",
  "swc-win32-x64-msvc"
);

if (fs.existsSync(nativeSwc)) {
  fs.rmSync(nativeSwc, { recursive: true, force: true });
}
