const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");
const uploadPdf = require("../middlewares/fileUploader");

router
  .use(fileUpload())
  //! Properties Routes /properties/
  .get("/search", propertiesControllers.searchProperties)
  .get("/", propertiesControllers.getAllProperties)
  .get("/:pId", propertiesControllers.getPropertyById)
  .post(
    "/",
    uploadPdf,
    uploadPic("properties"),
    propertiesControllers.createNewProperty
  )
  .patch(
    "/:pId",
    uploadPdf,
    uploadPic("properties"),
    propertiesControllers.updateProperty
  )
  .delete("/:pId", propertiesControllers.deleteProperty);

module.exports = router;
