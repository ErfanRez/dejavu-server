const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const uploader = require("../middlewares/userPic");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", usersController.searchUsersByUsername)
  .get("/", usersController.getAllUsers)
  .get("/:uId", usersController.getUserById)
  .post("/", uploader, usersController.createNewUser)
  .patch("/:uId", uploader, usersController.updateUser)
  .delete("/:uId", usersController.deleteUser);

module.exports = router;
