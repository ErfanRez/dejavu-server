const express = require("express");
const router = express.Router();
const usersController = require("../controllers/adminsController");
const uploader = require("../middlewares/userPic");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", usersController.searchAdmins)
  .get("/", usersController.getAllAdmins)
  .get("/:id", usersController.getAdminById)
  .post("/", uploader("admins"), usersController.createNewAdmin)
  .patch("/:id", uploader("admins"), usersController.updateAdmin)
  .delete("/:id", usersController.deleteAdmin);

module.exports = router;
