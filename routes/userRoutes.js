const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router
  .get("/", usersController.getAllUsers)
  .get("/:id", usersController.getUserById)
  .post("/", usersController.signUp)
  .post("/google", usersController.googleAuth)
  .delete("/:id", usersController.deleteUser)

  //! Users Auth Routes
  .post("/sign-in", usersController.SignIn);

module.exports = router;
