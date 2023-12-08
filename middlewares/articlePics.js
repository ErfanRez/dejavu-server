const sharp = require("sharp");
const path = require("path");
const fsPromises = require("fs").promises;
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
  } else if (req.body.title !== undefined) {
    // Title is provided

    // Check the MIME type of each uploaded image file
    for (const file of imageFiles) {
      if (!file.mimetype.startsWith("image")) {
        return res
          .status(400)
          .json({ message: "Only image files are allowed." });
      }
    }

    // Define the output folder for converted images
    const outputFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "articles",
      req.body.title
    );

    try {
      // Create the output folder if it doesn't exist
      await fsPromises.mkdir(outputFolder, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        console.error("Error creating output folder:", error);
        return res.status(500).json({ message: "Internal Server Error" });
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
      try {
        await sharp(imageData).toFormat("webp").toFile(outputImagePath);
        console.log("Image converted to WebP.");
      } catch (conversionError) {
        console.error("Error converting image to WebP:", conversionError);
        return res.status(500).json({ message: "Internal Server Error" });
      }

      const outputImageURL = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "images",
          "articles",
          req.body.title,
          webpFileName
        )
      ).toString();

      convertedImages.push(outputImageURL);
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
