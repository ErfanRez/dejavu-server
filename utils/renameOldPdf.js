const fsPromises = require("fs").promises;
const path = require("path");

const renameFile = async (oldFileName, newFileName) => {
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

  if (await fsPromises.stat(oldPdfPath)) {
    try {
      await fsPromises.rename(oldPdfPath, newPdfPath);
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  }
};

module.exports = renameFile;
