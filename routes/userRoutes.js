const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const favSalesController = require("../controllers/favSalesController");
const favRentsController = require("../controllers/favRentsController");
const uploader = require("../middlewares/userPic");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  //! Properties Routes /users/
  .get("/search", usersController.searchUsersByUsername)
  .get("/", usersController.getAllUsers)
  .get("/:uId", usersController.getUserById)
  .post("/", uploader, usersController.createNewUser)
  .patch("/:uId", uploader, usersController.updateUser)
  .delete("/:uId", usersController.deleteUser)
  //! Properties Routes /users/fav-sales
  .get("/:uId/fav-sales/search", favSalesController.searchUnitsByUID)
  .get("/:uId/fav-sales", favSalesController.getAllUnitsByUID)
  .post("/:uId/fav-sales", favSalesController.createNewFavSale)
  .delete("/:uId/fav-sales", favSalesController.deleteFavSale)
  //! Properties Routes /users/fav-rents
  .get("/:uId/fav-rents/search", favRentsController.searchUnitsByUID)
  .get("/:uId/fav-rents", favRentsController.getAllUnitsByUID)
  .post("/:uId/fav-rents", favRentsController.createNewFavRent)
  .delete("/:uId/fav-sales", favRentsController.deleteFavRent);

module.exports = router;
