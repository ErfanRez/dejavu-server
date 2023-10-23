const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploader = (subFolderName) => async (req, res, next) => {
  let imageFiles = req.files?.images || [];

  // Check if multiple/one file uploaded?
  if (!Array.isArray(imageFiles)) {
    // Handle the case of a single uploaded file
    imageFiles = [imageFiles];
  }

  // Check if any files were uploaded
  if (imageFiles.length === 0 && req.method !== "PATCH") {
    return res.status(400).json({ message: "At least one image required!" });
    // If it's a PATCH request, don't send an error response.
  } else if (req.body.title !== undefined) {
    // Title is provided

    // Define the output folder for converted images
    const outputFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      subFolderName,
      req.body.title
    );

    if (fs.existsSync(outputFolder)) {
      // Folder already exists, delete its contents
      fs.readdirSync(outputFolder).forEach((file) => {
        const filePath = path.join(outputFolder, file);
        fs.unlinkSync(filePath);
      });
    } else {
      // Folder doesn't exist, create it
      fs.mkdirSync(outputFolder, { recursive: true });
    }

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

      // Generate a unique file name for the WebP image
      const webpFileName = `${Date.now()}.webp`;

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
  } else {
    console.log("Title not provided.");
  }

  next();
};

module.exports = uploader;
