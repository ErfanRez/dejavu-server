const fs = require("fs");
const path = require("path");

function renameFile(subFolderName, oldFileName, newFileName) {
  const oldImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    subFolderName,
    oldFileName
  );

  const newImagePath = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    subFolderName,
    newFileName
  );

  if (fs.existsSync(oldImagePath)) {
    fs.renameSync(oldImagePath, newImagePath);
  }
}

module.exports = renameFile;
