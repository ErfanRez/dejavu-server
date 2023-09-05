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
const isImage = (req, file, callback) => {
  if (file.mimetype.startsWith("image")) {
    callback(null, true);
  } else {
    callback(null, Error("Image format is not correct!"));
  }
};

const upload = multer({
  storage: imgConfig,
  fileFilter: isImage,
  limits: {
    fileSize: Infinity,
  },
});

module.exports = upload;
