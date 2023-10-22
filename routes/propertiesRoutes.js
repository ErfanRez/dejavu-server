const express = require("express");
const router = express.Router();
const propertiesControllers = require("../controllers/propertiesController");
const saleUnitsController = require("../controllers/saleUnitsController");
const rentUnitsController = require("../controllers/rentUnitsController");
const amenitiesController = require("../controllers/amenitiesController");
const installmentsController = require("../controllers/installmentsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");
const uploadPdf = require("../middlewares/fileUploader");

router
  .use(fileUpload())
  //! Properties Routes /properties/sale-units
  .get("/search", propertiesControllers.searchProperties)
  .get("/", propertiesControllers.getAllProperties)
  .get("/:pId", propertiesControllers.getPropertyById)
  .post(
    "/",
    uploadPdf,
    uploadPic("properties"),
    propertiesControllers.createNewProperty
  )
  .patch(
    "/:pId",
    uploadPdf,
    uploadPic("properties"),
    propertiesControllers.updateProperty
  )
  .delete("/:pId", propertiesControllers.deleteProperty)
  //! Sale units Routes /properties/sale-units
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
  //! Rent units Routes /properties/rent-units
  .get("/rent-units/search", rentUnitsController.searchRentUnits)
  .get("/:pId/rent-units/search", rentUnitsController.searchUnitsByPID)
  .get("/rent-units", rentUnitsController.getAllRentUnits)
  .get("/:pId/rent-units", rentUnitsController.getAllUnitsByPID)
  .get("/rent-units/:rId", rentUnitsController.getRentUnitById)
  .post(
    "/:pId/rent-units",
    uploadPic("rents"),
    rentUnitsController.createNewRentUnit
  )
  .patch(
    "/rent-units/:rId",
    uploadPic("rents"),
    rentUnitsController.updateRentUnit
  )
  .delete("/rent-units/:rId", rentUnitsController.deleteRentUnit)
  //! Amenities Routes /properties/amenities
  .get("/amenities/search", amenitiesController.searchAmenities)
  .get("/:pId/amenities/search", amenitiesController.searchAmenitiesByPID)
  .get("/amenities", amenitiesController.getAllAmenities)
  .get("/:pId/amenities", amenitiesController.getAllAmenitiesByPID)
  .get("/amenities/:aId", amenitiesController.getAmenityById)
  .post("/:pId/amenities", amenitiesController.createNewAmenity)
  .patch("/amenities/:aId", amenitiesController.updateAmenity)
  .delete("/amenities/:aId", amenitiesController.deleteAmenity)
  //! installments Routes /properties/installments
  .get("/installments/search", installmentsController.searchInstallments)
  .get(
    "/:pId/installments/search",
    installmentsController.searchInstallmentsByPID
  )
  .get("/installments", installmentsController.getAllInstallments)
  .get("/:pId/installments", installmentsController.getAllInstallmentsByPID)
  .get("/installments/:inId", installmentsController.getInstallmentById)
  .post("/:pId/installments", installmentsController.createNewInstallment)
  .patch("/installments/:inId", installmentsController.updateInstallment)
  .delete("/installments/:inId", installmentsController.deleteInstallment);

module.exports = router;
