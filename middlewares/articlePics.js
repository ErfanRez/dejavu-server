const sharp = require("sharp");
const path = require("path");
const fsPromises = require("fs").promises;
const fs = require("fs");

const uploader = async (req, res, next) => {
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

    const fileName = req.body.title.match(/[a-zA-Z]+/g).join(" ");

    // Define the output folder for converted images
    const outputFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "articles",
      fileName
    );

    // Check if the file already exists
    if (fs.existsSync(outputFolder)) {
      // File already exists, delete it before saving the new one
      try {
        await fsPromises.rm(outputFolder, { recursive: true, force: true });
        console.log("Existing folder deleted.");
      } catch (deleteError) {
        console.error("Error deleting existing image:", deleteError);
        return res.status(500).json({ message: "Internal Server Error" });
      }
    }

    try {
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
            "articles",
            fileName,
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
      return res.status(500).json({ message: "Internal Server Error" });
    }
  } else {
    req.convertedImages = [];
    console.log("Title or images not provided.");
  }

  next();
};

module.exports = uploader;
