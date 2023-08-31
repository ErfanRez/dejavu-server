const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");

router
  .route("/")
  .get(propertiesControllers.getAllProperties)
  .post(propertiesControllers.createNewProperty)
  .patch(propertiesControllers.updateProperty)
  .delete(propertiesControllers.deleteProperty);

module.exports = router;
