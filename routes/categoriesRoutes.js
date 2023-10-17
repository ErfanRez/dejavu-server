const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const uploader = require("../middlewares/imageUploader");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/", propertiesControllers.getAllProperties)
  .get("/:id", propertiesControllers.getPropertyById)
  .post("/", uploader, propertiesControllers.createNewProperty) // use upload.array("files", 5) middleware if needed.
  .patch("/:id", uploader, propertiesControllers.updateProperty) // use upload.array("files", 5) middleware if needed.
  .delete("/:id", propertiesControllers.deleteProperty);

module.exports = router;
