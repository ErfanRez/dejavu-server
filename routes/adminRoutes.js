const express = require("express");
const router = express.Router();
const adminsController = require("../controllers/adminsController");
const uploader = require("../middlewares/userPic");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", adminsController.searchAdmins)
  .get("/", adminsController.getAllAdmins)
  .get("/:id", adminsController.getAdminById)
  .post("/", uploader("admins"), adminsController.createNewAdmin)
  .patch("/:id", uploader("admins"), adminsController.updateAdmin)
  .delete("/:id", adminsController.deleteAdmin);

module.exports = router;
