const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", verifyJWT, messagesController.getAllMessages)
  .get("/:id", verifyJWT, messagesController.getMessageById)
  .post("/", messagesController.createNewMessage)
  .delete("/", verifyJWT, messagesController.deleteMessages);

module.exports = router;
