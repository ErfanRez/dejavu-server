const express = require("express");
const router = express.Router();
const categoriesControllers = require("../controllers/categoriesController");

router
  .get("/", categoriesControllers.getAllCategories)
  .post("/", categoriesControllers.createNewCategory)
  .patch("/:id", categoriesControllers.updateCategory)
  .delete("/:id", categoriesControllers.deleteCategory);

module.exports = router;
