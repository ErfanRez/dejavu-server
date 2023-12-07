const path = require("path");
const fs = require("fs");
const fsPromises = require("fs").promises;
const capitalizer = require("../utils/capitalizer");

// PDF file upload middleware
const uploadPdf = async (req, res, next) => {
  const pdfFile = req.files?.pdf;

  if (!pdfFile) {
    console.log("No PDF file was uploaded.");
  } else if (req.body.title !== undefined) {
    if (pdfFile.mimetype !== "application/pdf") {
      return res.status(400).json({ message: "Only PDF files are allowed." });
    }

    const outputFolder = path.join(__dirname, "..", "uploads", "factSheets"); // Modify the folder path if needed

    // Create the folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      await fsPromises(outputFolder, { recursive: true });
    }

    // Generate a unique file name for the pdf file
    const pdfFileName = `${capitalizer(req.body.title)}.pdf`;

    // Define the full output file path
    const pdfFilePath = path.join(outputFolder, pdfFileName);

    // Move the uploaded PDF file to the destination folder
    pdfFile.mv(pdfFilePath, (err) => {
      if (err) {
        return res.status(500).json({ message: "Error saving the PDF file." });
      }
    });

    // Pass the generated file name to the next middleware or route

    const outputPdfURL = new URL(
      path.join(
        process.env.ROOT_PATH,
        "uploads",
        "factSheets",
        `${capitalizer(req.body.title)}.pdf`
      )
    ).toString();

    req.pdfUrl = outputPdfURL; // Set req.pdfUrl
  } else {
    console.log("Title not provided.");
  }

  next();
};

module.exports = uploadPdf;
