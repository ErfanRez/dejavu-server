const path = require("path");
const fs = require("fs");

// PDF file upload middleware
const uploadPdf = (req, res, next) => {
  const pdfFile = req.files?.pdf;

  if (!pdfFile) {
    console.log("No PDF file was uploaded.");
    next(); // Continue to the next middleware
  } else if (req.body.title !== undefined) {
    if (pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed." });
    }

    const outputFolder = path.join(__dirname, "..", "uploads", "factSheets"); // Modify the folder path if needed

    // Create the folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Generate a unique file name for the pdf file
    const pdfFileName = `${req.body.title}.pdf`;

    // Define the full output file path
    const pdfFilePath = path.join(outputFolder, pdfFileName);

    // Move the uploaded PDF file to the destination folder
    pdfFile.mv(pdfFilePath, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving the PDF file." });
      }
    });

    req.pdfUrl = pdfFilePath; // Set req.pdfUrl

    next();
  } else {
    console.log("Title not provided.");
    next();
  }
};

module.exports = uploadPdf;
