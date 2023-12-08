const sharp = require("sharp");
const path = require("path");
const fsPromises = require("fs").promises;
const fs = require("fs");
const capitalizer = require("../utils/capitalizer");

const uploader = (subFolderName) => async (req, res, next) => {
  let imageFiles = req.files?.images || [];

  // Check if multiple/one file uploaded?
  if (!Array.isArray(imageFiles)) {
    // Handle the case of a single uploaded file
    imageFiles = [imageFiles];
  }

  // Check if any files were uploaded
  if (
    imageFiles.length === 0 &&
    req.method !== "PATCH" &&
    req.method !== "patch"
  ) {
    return res.status(400).json({ message: "At least one image required!" });
    // If it's a PATCH request, don't send an error response.
  } else if (imageFiles.length !== 0 && req.body.title !== undefined) {
    // Title is provided
    const capTitle = capitalizer(req.body.title);

    // Define the output folder for converted images
    const outputFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      subFolderName,
      capTitle
    );

    try {
      // Check if the folder exists for POST method
      if (req.method === "POST" || req.method === "post") {
        if (!fs.existsSync(outputFolder)) {
          // Folder already exists, delete its contents
          await fsPromises.rm(outputFolder, { recursive: true, force: true });
        }
      }

      // Create the output folder if it doesn't exist
      await fsPromises.mkdir(outputFolder, { recursive: true });

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
            subFolderName,
            capTitle,
            webpFileName
          )
        ).toString();

        convertedImages.push(outputImageURL);
      }

      console.log("Images converted to WebP.");

      // Pass the generated file names to the next middleware or route
      req.convertedImages = convertedImages;
    } catch (error) {
      console.error("Error creating/deleting folder:", error);
      res.status(500).json({ message: "Internal Server Error" });
      return; // Stop further execution
    }
  } else {
    console.log("Title not provided.");
  }

  next();
};

module.exports = uploader;
