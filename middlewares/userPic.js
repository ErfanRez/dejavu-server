const sharp = require("sharp");
const path = require("path");
const fsPromises = require("fs").promises;

const uploader = (subFolderName) => async (req, res, next) => {
  const imageFile = req.files?.image;

  // Check if a file was uploaded
  if (!imageFile) {
    console.log("No files were uploaded.");
  } else if (req.body.username !== undefined) {
    if (!imageFile.mimetype.startsWith("image")) {
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
      subFolderName
    );

    // Create the output folder if it doesn't exist
    try {
      await fsPromises.mkdir(outputFolder, { recursive: true });
    } catch (error) {
      console.error("Error creating output folder:", error);
      // Handle the error, for example, by sending an error response
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Process the uploaded image and convert it to WebP format
    // Generate a unique file name for the WebP image
    const webpFileName = `${req.body.username}.webp`;

    // Define the full output file path
    const outputImagePath = path.join(outputFolder, webpFileName);

    console.log(outputImagePath);

    // Convert the image to WebP format using Sharp
    try {
      await sharp(imageData).toFormat("webp").toFile(outputImagePath);
      console.log("Image converted to WebP.");
    } catch (error) {
      console.error("Error converting image to WebP:", error);
      // Handle the error, for example, by sending an error response
      return res.status(500).json({ message: "Internal Server Error" });
    }

    // Pass the generated file name to the next middleware or route
    const outputImageURL = new URL(
      path.join(
        process.env.ROOT_PATH,
        "uploads",
        "images",
        subFolderName,
        `${req.body.username}.webp`
      )
    ).toString();

    req.convertedImage = outputImageURL;

    console.log("Image converted to WebP.");
  } else {
    console.log("Username not provided.");
  }

  next();
};

module.exports = uploader;
