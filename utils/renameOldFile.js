const fsPromises = require("fs").promises;
const path = require("path");

const renameFile = async (subFolderName, oldFileName, newFileName, res) => {
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

  try {
    // Check if the file exists
    if (await fsPromises.stat(oldImagePath)) {
      // If the file exists, proceed with renaming
      await fsPromises.rename(oldImagePath, newImagePath);
      console.log("File renamed successfully.");
    }
  } catch (error) {
    // Handle errors and respond to the client
    console.error("Error renaming file:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return; // Stop further execution
  }
};

module.exports = renameFile;
