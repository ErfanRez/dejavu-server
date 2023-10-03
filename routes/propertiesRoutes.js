const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const upload = require("../middleware/multerImage");
const converter = require("../middleware/imageConverter");

router
  .route("/")
  .get(propertiesControllers.getAllProperties)
  .post(
    upload.array("files", 5),
    converter,
    propertiesControllers.createNewProperty
  )
  .patch(upload.array("files", 5), propertiesControllers.updateProperty)
  .delete(propertiesControllers.deleteProperty);

module.exports = router;
