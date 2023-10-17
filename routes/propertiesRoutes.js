const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const uploader = require("../middleware/imageUploader");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .route("/")
  .get(propertiesControllers.getAllProperties)
  .post(uploader, propertiesControllers.createNewProperty) //! use upload.array("files", 5) middleware if needed.
  .patch(uploader, propertiesControllers.updateProperty) //! use upload.array("files", 5) middleware if needed.
  .delete(propertiesControllers.deleteProperty);

module.exports = router;
