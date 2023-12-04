const express = require("express");
const router = express.Router();
const amenitiesController = require("../controllers/amenitiesController");

router
  .get("/search", amenitiesController.searchAmenities)
  .get("/", amenitiesController.getAllAmenities)
  .get("/:id", amenitiesController.getAmenityById)
  .post("/", amenitiesController.createNewAmenity)
  .patch("/:id", amenitiesController.updateAmenity)
  .delete("/:id", amenitiesController.deleteAmenity)
  .delete("/", amenitiesController.deleteAmenities);

module.exports = router;
