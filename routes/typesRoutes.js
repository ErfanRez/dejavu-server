const express = require("express");
const router = express.Router();
const typesControllers = require("../controllers/typesController");

router
  .get("/", typesControllers.getAllTypes)
  .get("/:id", typesControllers.getTypeById)
  .post("/", typesControllers.createNewType)
  .patch("/:id", typesControllers.updateType)
  .delete("/:id", typesControllers.deleteType);

module.exports = router;
