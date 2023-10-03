const sharp = require("sharp");
const path = require("path");

const converter = async (req, res, next) => {
  try {
    // Get the uploaded file path
    const imagePath = req.file.path;

    // Define the output folder for converted images
    const outputFolder = path.join(__dirname, "..", "images");

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    // Generate a unique file name for the WebP image
    const webpFileName = `webp-${Date.now()}.webp`;

    // Define the full output file path
    const outputImagePath = path.join(outputFolder, webpFileName);

    // Convert the image to WebP format using Sharp
    await sharp(imagePath).toFormat("webp").toFile(outputImagePath);

    res.json({ message: "Image converted to WebP format", outputImagePath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = converter;
