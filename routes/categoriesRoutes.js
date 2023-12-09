const express = require("express");
const router = express.Router();
const categoriesControllers = require("../controllers/categoriesController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/search", categoriesControllers.searchCategories)
  .get("/", categoriesControllers.getAllCategories)
  .get("/:id", categoriesControllers.getCategoryById)
  .use(verifyJWT)
  .post("/", categoriesControllers.createNewCategory)
  .patch("/:id", categoriesControllers.updateCategory)
  .delete("/:id", categoriesControllers.deleteCategory)
  .delete("/", categoriesControllers.deleteCategories);

module.exports = router;
