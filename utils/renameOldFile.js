const fsPromises = require("fs").promises;
const path = require("path");

const renameFile = async (subFolderName, oldFileName, newFileName) => {
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

  if (await fsPromises.stat(oldImagePath)) {
    try {
      await fsPromises.rename(oldImagePath, newImagePath);
    } catch (error) {
      console.error("Error renaming file:", error);
    }
  }
};

module.exports = renameFile;
