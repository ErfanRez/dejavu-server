const express = require("express");
const router = express.Router();
const agentsControllers = require("../controllers/agentsController");
const uploader = require("../middlewares/agentPic");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/", agentsControllers.getAllAgents)
  .get("/:agentId", agentsControllers.getAgentById)
  .post("/", uploader, agentsControllers.createNewAgent)
  .patch("/:agentId", uploader, agentsControllers.updateAgent)
  .delete("/:agentId", agentsControllers.deleteAgent);

module.exports = router;
