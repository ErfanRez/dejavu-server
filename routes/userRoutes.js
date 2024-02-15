const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", verifyJWT, usersController.getAllUsers)
  .get("/:id", usersController.getUserById)
  .post("/", usersController.signUp)
  .post("/google", usersController.googleAuth)
  .delete("/:id", verifyJWT, usersController.deleteUser)

  //! Users Auth Routes
  .post("/sign-in", usersController.signIn);

module.exports = router;
