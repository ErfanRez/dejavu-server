const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const fspromises = require("fs").promises;

const uploader = async (req, res, next) => {
  try {
    const imageFiles = req.files?.images || [];

    // Check if files were uploaded successfully
    if (!imageFiles || !Array.isArray(imageFiles) || imageFiles.length === 0) {
      console.log("No files were uploaded.");
      req.convertedImages = [];
      next();
    } else {
      // Get the uploaded file data
      const imagesData = imageFiles.map((image) => image.data);

      // Define the output folder for converted images
      const outputFolder = path.join(
        __dirname,
        "..",
        "images",
        "articles",
        req.body.title
      );

      // Create the output folder if it doesn't exist
      if (!fs.existsSync(outputFolder)) {
        await fspromises.mkdir(outputFolder);
      }

      const convertedImages = [];

      // Process each uploaded image and convert it to WebP format
      for (const imageData of imagesData) {
        // Generate a unique file name for the WebP image
        const webpFileName = `webp-${Date.now()}.webp`;

        // Define the full output file path
        const outputImagePath = path.join(outputFolder, webpFileName);

        console.log(outputImagePath);

        // Convert the image to WebP format using Sharp
        await sharp(imageData).toFormat("webp").toFile(outputImagePath);

        convertedImages.push(outputImagePath);
      }

      console.log("Images converted to Webp.");
      // Pass the generated file names to the next middleware or route
      req.convertedImages = convertedImages;
      next();
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = uploader;
