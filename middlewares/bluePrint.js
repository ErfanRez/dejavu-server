const sharp = require("sharp");
const path = require("path");
const fsPromises = require("fs").promises;

const uploader = async (req, res, next) => {
  const imageFile = req.files?.bluePrint;

  // Check if a file was uploaded
  if (!imageFile) {
    console.log("No files were uploaded.");
  } else if (req.body.title !== undefined) {
    if (!imageFile.mimetype.startsWith("image")) {
      return res.status(400).json({ message: "Only image files are allowed." });
    }

    // Get the uploaded file data
    const imageData = imageFile.data;

    // Define the output folder for converted image
    const outputFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "bluePrints"
    );

    // Create the output folder if it doesn't exist
    try {
      await fsPromises.mkdir(outputFolder, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        console.error("Error creating output folder:", error);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }

    // Process the uploaded image and convert it to WebP format
    // Generate a unique file name for the WebP image
    const webpFileName = `${req.body.title}.webp`;

    // Define the full output file path
    const outputImagePath = path.join(outputFolder, webpFileName);

    console.log(outputImagePath);

    // Convert the image to WebP format using Sharp
    try {
      await sharp(imageData).toFormat("webp").toFile(outputImagePath);
      console.log("Image converted to WebP.");
    } catch (conversionError) {
      console.error("Error converting image to WebP:", conversionError);
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Pass the generated file name to the next middleware or route
    const outputImageURL = new URL(
      path.join(
        process.env.ROOT_PATH,
        "uploads",
        "images",
        "bluePrints",
        `${req.body.title}.webp`
      )
    ).toString();

    req.bluePrint = outputImageURL;

    console.log("Image converted to WebP.");
  } else {
    console.log("Title not provided.");
  }

  next();
};

module.exports = uploader;
