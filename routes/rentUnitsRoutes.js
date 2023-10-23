const express = require("express");
const router = express.Router();
const rentUnitsController = require("../controllers/rentUnitsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", rentUnitsController.searchRentUnits)
  .get("/:pId/search", rentUnitsController.searchUnitsByPID)
  .get("/", rentUnitsController.getAllRentUnits)
  .get("/:pId", rentUnitsController.getAllUnitsByPID)
  .get("/:rId", rentUnitsController.getRentUnitById)
  .post("/:pId", uploadPic("rents"), rentUnitsController.createNewRentUnit)
  .patch("/:rId", uploadPic("rents"), rentUnitsController.updateRentUnit)
  .delete("/:rId", rentUnitsController.deleteRentUnit);

module.exports = router;
