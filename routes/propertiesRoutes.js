const express = require("express");
const router = express.Router();
const salePropsController = require("../controllers/salePropsController");
const rentPropsController = require("../controllers/rentPropsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");
const uploadPdf = require("../middlewares/fileUploader");
const bluePrint = require("../middlewares/bluePrint");

router
  .use(fileUpload())

  //! sale properties routes /sale
  .get("/sale/search", salePropsController.searchSales)
  .get("/sale", salePropsController.getAllSales)
  .get("/sale/:sId", salePropsController.getSaleById)
  .post(
    "/sale",
    uploadPdf,
    bluePrint,
    uploadPic("sales"),
    salePropsController.createNewSale
  )
  .patch(
    "/sale/:sId",
    uploadPdf,
    bluePrint,
    uploadPic("sales"),
    salePropsController.updateSale
  )
  .patch("/sale/agent/:sId", salePropsController.updatePropertyAgent)
  .delete("/sale/:sId", salePropsController.deleteSale)
  .delete("/sale", salePropsController.deleteSales)

  //! rent properties routes /rent
  .get("/rent/search", rentPropsController.searchRents)
  .get("/rent", rentPropsController.getAllRents)
  .get("/rent/:rId", rentPropsController.getRentById)
  .post(
    "/rent",
    uploadPdf,
    uploadPic("rents"),
    rentPropsController.createNewRent
  )
  .patch(
    "/rent/:rId",
    uploadPdf,
    uploadPic("rents"),
    rentPropsController.updateRent
  )
  .patch("/rent/agent/:rId", rentPropsController.updatePropertyAgent)
  .delete("/rent/:rId", rentPropsController.deleteRent)
  .delete("/rent", rentPropsController.deleteRents);

module.exports = router;
