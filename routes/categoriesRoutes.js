const express = require("express");
const router = express.Router();
const categoriesControllers = require("../controllers/categoriesController");

router
  .get("/", categoriesControllers.getAllCategories)
  .post("/", categoriesControllers.createNewCategory)
  .patch("/:catId", categoriesControllers.updateCategory)
  .delete("/:catId", categoriesControllers.deleteCategory);

module.exports = router;
