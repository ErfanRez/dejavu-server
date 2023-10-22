const sharp = require("sharp");
const path = require("path");
const fs = require("fs");

const uploader = async (req, res, next) => {
  const imageFile = req.files?.image;

  // Check if a file was uploaded
  if (!imageFile) {
    console.log("No files were uploaded.");
    next();
  } else {
    if (imageFile.mimetype.startsWith("image")) {
      return res.status(400).json({ message: "Only image files are allowed." });
    }

    // Get the uploaded file data
    const imageData = imageFile.data;

    // Define the output folder for converted images
    const outputFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "users"
    );

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder, { recursive: true });
    }

    // Process the uploaded image and convert it to WebP format
    // Generate a unique file name for the WebP image
    const webpFileName = `${req.body.username}.webp`;

    // Define the full output file path
    const outputImagePath = path.join(outputFolder, webpFileName);

    console.log(outputImagePath);

    // Convert the image to WebP format using Sharp
    await sharp(imageData).toFormat("webp").toFile(outputImagePath);

    console.log("Image converted to WebP.");
    // Pass the generated file name to the next middleware or route
    req.convertedImage = outputImagePath;

    next();
  }
};

module.exports = uploader;
