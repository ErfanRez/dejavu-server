const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
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
    callback(null, Error("only image is allowed"));
  }
};

var upload = multer({
  storage: imgConfig,
  fileFilter: isImage,
  limits: {
    fileSize: Infinity,
  },
});

router
  .route("/")
  .get(propertiesControllers.getAllProperties)
  .post(upload.single("photo"), propertiesControllers.createNewProperty)
  .patch(propertiesControllers.updatedProperty)
  .delete(propertiesControllers.deleteProperty);

module.exports = router;
