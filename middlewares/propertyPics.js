const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const fspromises = require("fs").promises;

const uploader = (subFolderName) => async (req, res, next) => {
  try {
    let imageFiles = req.files?.images || [];

    // Check if files were uploaded successfully
    if (!Array.isArray(imageFiles)) {
      // Handle the case of a single uploaded file
      imageFiles = [imageFiles];
    }

    // Check if any files were uploaded
    if (imageFiles.length === 0) {
      res.status(400).json({ message: "At least one image required!" });
    } else {
      const convertedImages = [];

      // Process each uploaded image and convert it to WebP format
      for (const image of imageFiles) {
        const imageData = image.data;

        // Define the output folder for converted images
        const outputFolder = path.join(
          __dirname,
          "..",
          "images",
          subFolderName,
          req.body.title
        );

        // Create the output folder if it doesn't exist
        if (!fs.existsSync(outputFolder)) {
          await fspromises.mkdir(outputFolder);
        }

        // Generate a unique file name for the WebP image
        const webpFileName = `${req.body.title}-${Date.now()}.webp`;

        // Define the full output file path
        const outputImagePath = path.join(outputFolder, webpFileName);

        console.log(outputImagePath);

        // Convert the image to WebP format using Sharp
        await sharp(imageData).toFormat("webp").toFile(outputImagePath);

        convertedImages.push(outputImagePath);
      }

      console.log("Images converted to WebP.");
      // Pass the generated file names to the next middleware or route
      req.convertedImages = convertedImages;
      next();
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = uploader;
