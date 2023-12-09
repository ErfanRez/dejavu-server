const express = require("express");
const router = express.Router();
const messagesController = require("../controllers/messagesController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", messagesController.getAllMessages)
  .get("/:id", messagesController.getMessageById)
  .post("/", messagesController.createNewMessage)
  .delete("/:id", messagesController.deleteMessage)
  .delete("/", messagesController.deleteMessages);

module.exports = router;
