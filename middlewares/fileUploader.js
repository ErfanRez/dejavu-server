const multer = require("multer");
const path = require("path");
// const fs = require("fs-extra"); // Import the fs-extra library

// PDF storage config
const pdfConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    const folderName = "./factSheets"; // You can modify the folder path if needed

    // Ensure the directory exists, creating it if necessary
    //? fs.ensureDirSync(folderName); //npm install fs-extra

    callback(null, folderName);
  },
  filename: (req, file, callback) => {
    const pdfUrl = `/FactSheets/pdf-${req.body.title}.pdf`;
    req.pdfUrl = pdfUrl; // Set req.pdfUrl
    callback(null, `pdf-${req.body.title}.pdf`);
  },
});

// PDF filter
const fileFilter = (req, file, callback) => {
  if (file.mimetype === "application/pdf") {
    callback(null, true);
  } else {
    callback(new Error("Only PDF files are allowed!"), false);
  }
};

const fileSizeLimit = 20 * 1024 * 1024; // 20MB limit for PDF files;

const upload = multer({
  storage: pdfConfig,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileSizeLimit,
  },
});

module.exports = upload;
