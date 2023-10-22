const fs = require("fs");
const path = require("path");

function renameFile(oldFileName, newFileName) {
  const oldImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    oldFileName
  );

  const newImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    newFileName
  );

  if (fs.existsSync(oldImagePath)) {
    fs.renameSync(oldImagePath, newImagePath);
  }
}

module.exports = renameFile;
