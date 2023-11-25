const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const uploader = require("../middlewares/userPic");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", usersController.searchUsers)
  .get("/", usersController.getAllUsers)
  .get("/:id", usersController.getUserById)
  .post("/", uploader("users"), usersController.createNewUser)
  .patch("/:id", uploader, usersController.updateUser)
  .delete("/:id", usersController.deleteUser);

module.exports = router;
