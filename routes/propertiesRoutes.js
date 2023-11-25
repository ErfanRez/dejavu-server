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

  //! sale properties routes /sales
  .get("/sales/search", salePropsController.searchSales)
  .get("/sales", salePropsController.getAllSales)
  .get("/sales/:sId", salePropsController.getSaleById)
  .post(
    "/sales",
    uploadPdf,
    bluePrint,
    uploadPic("sales"),
    salePropsController.createNewSale
  )
  .patch(
    "/sales/:sId",
    uploadPdf,
    bluePrint,
    uploadPic("sales"),
    salePropsController.updateSale
  )
  .delete("/sales/:sId", salePropsController.deleteSale)

  //! rent properties routes /rents
  .get("/rents/search", rentPropsController.searchRents)
  .get("/rents", rentPropsController.getAllRents)
  .get("/rents/:rId", rentPropsController.getRentById)
  .post(
    "/rents",
    uploadPdf,
    uploadPic("rents"),
    rentPropsController.createNewRent
  )
  .patch(
    "/rents/:rId",
    uploadPdf,
    uploadPic("rents"),
    rentPropsController.updateRent
  )
  .delete("/rents/:rId", rentPropsController.deleteRent);

module.exports = router;
