const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const upload = require("../middleware/multerImage");
const converter = require("../middleware/imageConverter");

router
  .route("/")
  .get(propertiesControllers.getAllProperties)
  .post(converter, propertiesControllers.createNewProperty) //! use upload.array("files", 5) middleware if needed.
  .patch(converter, propertiesControllers.updateProperty) //! use upload.array("files", 5) middleware if needed.
  .delete(propertiesControllers.deleteProperty);

module.exports = router;
