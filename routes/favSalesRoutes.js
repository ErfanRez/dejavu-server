const express = require("express");
const router = express.Router();
const favSalesController = require("../controllers/favSalesController");

router
  .get("/:uId/search", favSalesController.searchUnitsByUID)
  .get("/:uId", favSalesController.getAllUnitsByUID)
  .post("/:uId", favSalesController.createNewFavSale)
  .delete("/:uId", favSalesController.deleteFavSale);

module.exports = router;
