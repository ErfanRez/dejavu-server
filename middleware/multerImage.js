const multer = require("multer");
const path = require("path");

//* image storage config
const imgConfig = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "./uploads");
  },
  filename: (req, file, callback) => {
    callback(null, `image-${Date.now()}${path.extname(file.originalname)}`);
  },
});

//* image filter
const fileFilter = (req, file, callback) => {
  if (file.mimetype === "image/webp") {
    //* Accepts only .webp files
    callback(null, true);
  } else {
    callback(new Error("Only .webp images are allowed"), false);
  }
};

const fileSizeLimit = 2 * 1024 * 1024;

const upload = multer({
  storage: imgConfig,
  fileFilter: fileFilter,
  limits: {
    fileSize: fileSizeLimit,
  },
});

module.exports = upload;
