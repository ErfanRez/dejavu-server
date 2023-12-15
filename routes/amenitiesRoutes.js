const express = require("express");
const router = express.Router();
const amenitiesController = require("../controllers/amenitiesController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", amenitiesController.getAllAmenities)
  .get("/:id", amenitiesController.getAmenityById)
  .use(verifyJWT)
  .post("/", amenitiesController.createNewAmenity)
  .patch("/:id", amenitiesController.updateAmenity)
  .delete("/:id", amenitiesController.deleteAmenity)
  .delete("/", amenitiesController.deleteAmenities);

module.exports = router;
