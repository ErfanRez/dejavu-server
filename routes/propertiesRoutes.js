const express = require("express");
const router = express.Router();
const salePropsController = require("../controllers/salePropsController");
const rentPropsController = require("../controllers/rentPropsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");
const uploadPdf = require("../middlewares/fileUploader");
const bluePrint = require("../middlewares/bluePrint");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .use(fileUpload())

  //! sale properties routes /sale
  .get("/sale/search", salePropsController.searchSales)
  .get("/sale", salePropsController.getAllSales)
  .get("/sale/:sId", salePropsController.getSaleById)
  .post(
    "/sale",
    verifyJWT,
    uploadPdf,
    bluePrint,
    uploadPic("sales"),
    salePropsController.createNewSale
  )
  .patch(
    "/sale/:sId",
    verifyJWT,
    uploadPdf,
    bluePrint,
    uploadPic("sales"),
    salePropsController.updateSale
  )
  .patch("/sale/agent/:sId", verifyJWT, salePropsController.updatePropertyAgent)
  .delete("/sale/:sId", verifyJWT, salePropsController.deleteSale)
  .delete("/sale", verifyJWT, salePropsController.deleteSales)

  //! rent properties routes /rent
  .get("/rent/search", rentPropsController.searchRents)
  .get("/rent", rentPropsController.getAllRents)
  .get("/rent/:rId", rentPropsController.getRentById)
  .post(
    "/rent",
    verifyJWT,
    uploadPdf,
    uploadPic("rents"),
    rentPropsController.createNewRent
  )
  .patch(
    "/rent/:rId",
    verifyJWT,
    uploadPdf,
    uploadPic("rents"),
    rentPropsController.updateRent
  )
  .patch("/rent/agent/:rId", verifyJWT, rentPropsController.updatePropertyAgent)
  .delete("/rent/:rId", verifyJWT, rentPropsController.deleteRent)
  .delete("/rent", verifyJWT, rentPropsController.deleteRents);

module.exports = router;
