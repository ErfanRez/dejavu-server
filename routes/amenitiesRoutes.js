const express = require("express");
const router = express.Router();
const amenitiesController = require("../controllers/amenitiesController");

router
  .get("/search", amenitiesController.searchAmenities)
  .get("/:pId/search", amenitiesController.searchAmenitiesByPID)
  .get("/", amenitiesController.getAllAmenities)
  .get("/:pId", amenitiesController.getAllAmenitiesByPID)
  .get("/:aId", amenitiesController.getAmenityById)
  .post("/:pId", amenitiesController.createNewAmenity)
  .patch("/:aId", amenitiesController.updateAmenity)
  .delete("/:aId", amenitiesController.deleteAmenity);

module.exports = router;
