const fsPromises = require("fs").promises;

const deleteFolderAndContents = async (folderPath, res) => {
  try {
    // Check if the folder exists
    if (await fsPromises.stat(folderPath)) {
      // If the folder exists, proceed with deletion
      await fsPromises.rm(folderPath, { recursive: true, force: true });
      console.log("Folder deleted successfully.");
    }
  } catch (error) {
    // Handle errors and respond to the client
    console.error("Error deleting folder:", error);
    res.status(500).json({ message: "Internal Server Error" });
    return; // Stop further execution
  }
};

module.exports = deleteFolderAndContents;
