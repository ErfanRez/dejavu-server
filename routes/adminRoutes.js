const express = require("express");
const router = express.Router();
const adminsController = require("../controllers/adminsController");
const uploader = require("../middlewares/userPic");
const fileUpload = require("express-fileupload");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .use(fileUpload())
  // .use(verifyJWT)
  .get("/search", adminsController.searchAdmins)
  .get("/", adminsController.getAllAdmins)
  .get("/:id", adminsController.getAdminById)
  .post("/", uploader, adminsController.createNewAdmin)
  .patch("/:id", uploader, adminsController.updateAdmin)
  .delete("/:id", adminsController.deleteAdmin);

module.exports = router;
