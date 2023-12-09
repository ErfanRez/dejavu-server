const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router
  .get("/search", usersController.searchUsers)
  .get("/", usersController.getAllUsers)
  .get("/:id", usersController.getUserById)
  .post("/", usersController.createNewUser)
  .patch("/:id", usersController.updateUser)
  .delete("/:id", usersController.deleteUser);

module.exports = router;
