const express = require("express");
const router = express.Router();
const typesControllers = require("../controllers/typesController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", typesControllers.getAllTypes)
  .get("/:id", typesControllers.getTypeById)
  .use(verifyJWT)
  .post("/", typesControllers.createNewType)
  .patch("/:id", typesControllers.updateType)
  .delete("/:id", typesControllers.deleteType)
  .delete("/", typesControllers.deleteTypes);

module.exports = router;
