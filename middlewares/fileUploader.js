const path = require("path");
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

    const fileName = req.body.title.match(/[a-zA-Z]+/g).join(" ");
    const capTitle = capitalizer(fileName);

    const outputFolder = path.join(__dirname, "..", "uploads", "factSheets"); // Modify the folder path if needed

    // Create the folder if it doesn't exist
    try {
      await fsPromises.mkdir(outputFolder, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        console.error("Error creating output folder:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }

    // Generate a unique file name for the pdf file
    const pdfFileName = `${capTitle}.pdf`;

    // Define the full output file path
    const pdfFilePath = path.join(outputFolder, pdfFileName);

    // Move the uploaded PDF file to the destination folder
    try {
      await pdfFile.mv(pdfFilePath);
    } catch (moveError) {
      console.error("Error moving the PDF file:", moveError);
      return res.status(500).json({ message: "Error saving the PDF file." });
    }

    // Pass the generated file name to the next middleware or route
    const outputPdfURL = new URL(
      path.join(
        process.env.ROOT_PATH,
        "uploads",
        "factSheets",
        `${capTitle}.pdf`
      )
    ).toString();

    req.pdfUrl = outputPdfURL; // Set req.pdfUrl
  } else {
    console.log("Title not provided.");
  }

  next();
};

module.exports = uploadPdf;
