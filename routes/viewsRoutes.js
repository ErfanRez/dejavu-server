const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/viewsController");

router
  .get("/search", viewsController.searchTypes)
  .get("/", viewsController.getAllViews)
  .get("/:id", viewsController.getViewById)
  .post("/", viewsController.createNewView)
  .patch("/:id", viewsController.updateView)
  .delete("/:id", viewsController.deleteView)
  .delete("/", viewsController.deleteViews);

module.exports = router;
