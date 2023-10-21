const fs = require("fs");

function deleteFolderAndContents(folderPath) {
  // Check if the folder exists
  if (fs.existsSync(folderPath)) {
    // Delete the folder and its contents
    fs.rmSync(folderPath, { recursive: true, force: true });
  }
}

module.exports = deleteFolderAndContents;
