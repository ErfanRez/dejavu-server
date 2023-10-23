const express = require("express");
const router = express.Router();
const favSalesController = require("../controllers/favSalesController");
const favRentsController = require("../controllers/favRentsController");

router
  //! Favorite sale units routes /fav-sales
  .get("/:uId/fav-sales/search", favSalesController.searchUnitsByUID)
  .get("/:uId/fav-sales", favSalesController.getAllUnitsByUID)
  .post("/:uId/fav-sales", favSalesController.createNewFavSale)
  .delete("/:uId/fav-sales", favSalesController.deleteFavSale)
  //! Favorite sale units routes /fav-rents
  .get("/:uId/fav-rents/search", favRentsController.searchUnitsByUID)
  .get("/:uId/fav-rents", favRentsController.getAllUnitsByUID)
  .post("/:uId/fav-rents", favRentsController.createNewFavRent)
  .delete("/:uId/fav-rents", favRentsController.deleteFavRent);

module.exports = router;
