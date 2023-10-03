const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const fspromises = require("fs").promises;

const converter = async (req, res, next) => {
  try {
    // Get the uploaded file path
    const imagePaths = req.files.map((file) => file.path);

    // Define the output folder for converted images
    const outputFolder = path.join(__dirname, "..", "images");

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      await fspromises.mkdir(outputFolder);
    }

    const convertedImages = [];

    // Process each uploaded image and convert it to WebP format
    for (const imagePath of imagePaths) {
      // Generate a unique file name for the WebP image
      const webpFileName = `webp-${Date.now()}.webp`;

      // Define the full output file path
      const outputImagePath = path.join(outputFolder, webpFileName);

      // Convert the image to WebP format using Sharp
      await sharp(imagePath).toFormat("webp").toFile(outputImagePath);

      convertedImages.push(outputImagePath);
    }

    console.log("Images converted to Webp.");
  } catch (error) {
    console.error(error);
  }

  next();
};

module.exports = converter;
