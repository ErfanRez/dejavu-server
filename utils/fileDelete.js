const fsPromises = require("fs").promises;

const deleteFolderAndContents = async (folderPath) => {
  // Check if the folder exists
  if (await fsPromises.stat(folderPath)) {
    // Delete the folder and its contents
    try {
      await fsPromises.rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      console.error("Error deleting folder:", error);
    }
  }
};

module.exports = deleteFolderAndContents;
