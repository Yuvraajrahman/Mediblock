const fs = require("fs");
const path = require("path");

const requiredFiles = ["index.html", "styles.css", "script.js"];
const missingFiles = requiredFiles.filter((file) => {
  return !fs.existsSync(path.join(process.cwd(), file));
});

if (missingFiles.length > 0) {
  console.error(`Missing required site files: ${missingFiles.join(", ")}`);
  process.exit(1);
}

console.log("Static site is ready for deployment.");
