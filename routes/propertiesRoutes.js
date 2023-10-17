const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const converter = require("../middleware/imageConverter");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .route("/")
  .get(propertiesControllers.getAllProperties)
  .post(converter, propertiesControllers.createNewProperty) //! use upload.array("files", 5) middleware if needed.
  .patch(converter, propertiesControllers.updateProperty) //! use upload.array("files", 5) middleware if needed.
  .delete(propertiesControllers.deleteProperty);

module.exports = router;
