const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router
  .get("/", usersController.getAllUsers)
  .get("/:id", usersController.getUserById)
  .post("/", usersController.createNewUser)
  .delete("/:id", usersController.deleteUser);

module.exports = router;
