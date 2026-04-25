const fs = require("fs");
const path = require("path");

const requiredFiles = ["index.html", "styles.css", "script.js", "contracts/PatientManagement.sol"];

for (const file of requiredFiles) {
  const fullPath = path.join(__dirname, "..", file);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Missing required file: ${file}`);
  }
}

console.log("Static production build is ready for Vercel.");
