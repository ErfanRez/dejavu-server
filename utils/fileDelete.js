const fsPromises = require("fs").promises;
const fs = require("fs");

const deleteFolderAndContents = async (folderPath, res) => {
  try {
    // Check if the folder exists
    if (fs.existsSync(folderPath)) {
      // If the folder exists, proceed with deletion
      await fsPromises.rm(folderPath, { recursive: true, force: true });
      console.log("Folder deleted successfully.");
    }
  } catch (error) {
    // Handle errors and respond to the client
    console.error("Error deleting folder:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = deleteFolderAndContents;
