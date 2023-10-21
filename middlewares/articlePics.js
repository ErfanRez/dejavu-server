const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploader = async (req, res, next) => {
  let imageFiles = req.files?.images || [];

  // Check if multiple/one files uploaded
  if (!Array.isArray(imageFiles)) {
    // Handle the case of a single uploaded file
    imageFiles = [imageFiles];
  }

  // Check if any files were uploaded
  if (imageFiles.length === 0) {
    console.log("No files were uploaded.");
    req.convertedImages = [];
    next();
  } else {
    // Check the MIME type of each uploaded image file
    for (const file of imageFiles) {
      if (!file.mimetype.startsWith("image")) {
        return res
          .status(400)
          .json({ message: "Only image files are allowed." });
      }
    }

    const convertedImages = [];

    // Process each uploaded image and convert it to WebP format
    for (const image of imageFiles) {
      const imageData = image.data;

      // Define the output folder for converted images
      const outputFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "articles",
        req.body.title
      );

      // Create the output folder if it doesn't exist
      if (!fs.existsSync(outputFolder)) {
        fs.mkdirSync(outputFolder, { recursive: true });
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
};

module.exports = uploader;
