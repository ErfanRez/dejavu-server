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

//* img filter
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/webp") {
    // Accept only .webp files
    cb(null, true);
  } else {
    cb(new Error("Only .webp images are allowed"), false);
  }
};

const upload = multer({
  storage: imgConfig,
  fileFilter: fileFilter,
  limits: {
    fileSize: Infinity,
  },
});

module.exports = upload;
