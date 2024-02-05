const fsPromises = require("fs").promises;
const fs = require("fs");
const path = require("path");

const renameFile = async (oldFileName, newFileName, res) => {
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

  try {
    // Check if the file exists
    if (fs.existsSync(oldPdfPath)) {
      // If the file exists, proceed with renaming
      await fsPromises.rename(oldPdfPath, newPdfPath);
      console.log("File renamed successfully.");
    }
  } catch (error) {
    // Handle errors and respond to the client
    console.error("Error renaming file:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = renameFile;
