const express = require("express");
const router = express.Router();
const agentsControllers = require("../controllers/agentsController");
const uploader = require("../middlewares/agentPic");
const fileUpload = require("express-fileupload");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .use(fileUpload())
  .get("/search", agentsControllers.searchAgents)
  .get("/", agentsControllers.getAllAgents)
  .get("/:id", agentsControllers.getAgentById)
  .use(verifyJWT)
  .post("/", uploader, agentsControllers.createNewAgent)
  .patch("/:id", uploader, agentsControllers.updateAgent)
  .delete("/:id", agentsControllers.deleteAgent);

module.exports = router;
