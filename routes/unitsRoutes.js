const express = require("express");
const router = express.Router();
const saleUnitsController = require("../controllers/saleUnitsController");
const rentUnitsController = require("../controllers/rentUnitsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  //! sale units routes /sale-units
  .get("/sale-units/search", saleUnitsController.searchSaleUnits)
  .get("/:pId/sale-units/search", saleUnitsController.searchUnitsByPID)
  .get("/sale-units", saleUnitsController.getAllSaleUnits)
  .get("/:pId/sale-units", saleUnitsController.getAllUnitsByPID)
  .get("/sale-units/:sId", saleUnitsController.getSaleUnitById)
  .post(
    "/:pId/sale-units",
    uploadPic("sales"),
    saleUnitsController.createNewSaleUnit
  )
  .patch(
    "/sale-units/:sId",
    uploadPic("sales"),
    saleUnitsController.updateSaleUnit
  )
  .delete("/sale-units/:sId", saleUnitsController.deleteSaleUnit)
  //! rent units routes /rent-units
  .get("/rent-units/search", rentUnitsController.searchRentUnits)
  .get("/:pId/rent-units/search", rentUnitsController.searchUnitsByPID)
  .get("/rent-units", rentUnitsController.getAllRentUnits)
  .get("/:pId/rent-units", rentUnitsController.getAllUnitsByPID)
  .get("/rent-units/:sId", rentUnitsController.getRentUnitById)
  .post(
    "/:pId/rent-units",
    uploadPic("rents"),
    rentUnitsController.createNewRentUnit
  )
  .patch(
    "/rent-units/:sId",
    uploadPic("rents"),
    rentUnitsController.updateRentUnit
  )
  .delete("/rent-units/:sId", rentUnitsController.deleteRentUnit);

module.exports = router;
