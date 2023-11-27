const express = require("express");
const router = express.Router();
const amenitiesController = require("../controllers/amenitiesController");

router
  .get("/search", amenitiesController.searchAmenities)
  .get("/", amenitiesController.getAllAmenities)
  .get("/get-one/:id", amenitiesController.getAmenityById)
  .post("/", amenitiesController.createNewAmenity)
  .patch("/:id", amenitiesController.updateAmenity)
  .delete("/:id", amenitiesController.deleteAmenity);

module.exports = router;
