const fs = require("fs");
const path = require("path");

function renameFile(oldFileName, newFileName) {
  const oldPdfPath = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    oldFileName
  );

  const newPdfPath = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    newFileName
  );

  if (fs.existsSync(oldPdfPath)) {
    fs.renameSync(oldPdfPath, newPdfPath);
  }
}

module.exports = renameFile;
