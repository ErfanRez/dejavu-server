const express = require("express");
const router = express.Router();
const viewsController = require("../controllers/viewsController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", viewsController.getAllViews)
  .get("/:id", viewsController.getViewById)
  .use(verifyJWT)
  .post("/", viewsController.createNewView)
  .patch("/:id", viewsController.updateView)
  .delete("/:id", viewsController.deleteView)
  .delete("/", viewsController.deleteViews);

module.exports = router;
