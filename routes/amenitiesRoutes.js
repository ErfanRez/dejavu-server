const express = require("express");
const router = express.Router();
const amenitiesController = require("../controllers/amenitiesController");

router
  .get("/search", amenitiesController.searchAmenities)
  .get("/", amenitiesController.getAllAmenities)
  .get("/get-one/:aId", amenitiesController.getAmenityById)
  .post("/", amenitiesController.createNewAmenity)
  .patch("/:aId", amenitiesController.updateAmenity)
  .delete("/:aId", amenitiesController.deleteAmenity);

module.exports = router;
