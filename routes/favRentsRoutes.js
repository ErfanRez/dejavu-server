const express = require("express");
const router = express.Router();
const favRentsController = require("../controllers/favRentsController");

router
  .get("/:uId/search", favRentsController.searchUnitsByUID)
  .get("/:uId", favRentsController.getAllUnitsByUID)
  .post("/:uId", favRentsController.createNewFavRent)
  .delete("/:uId", favRentsController.deleteFavRent);

module.exports = router;
