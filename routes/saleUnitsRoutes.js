const express = require("express");
const router = express.Router();
const saleUnitsController = require("../controllers/saleUnitsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", saleUnitsController.searchSaleUnits)
  .get("/:pId/search", saleUnitsController.searchUnitsByPID)
  .get("/", saleUnitsController.getAllSaleUnits)
  .get("/:pId", saleUnitsController.getAllUnitsByPID)
  .get("/:sId", saleUnitsController.getSaleUnitById)
  .post("/:pId", uploadPic("sales"), saleUnitsController.createNewSaleUnit)
  .patch("/:sId", uploadPic("sales"), saleUnitsController.updateSaleUnit)
  .delete("/:sId", saleUnitsController.deleteSaleUnit);

module.exports = router;
