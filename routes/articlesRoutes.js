const express = require("express");
const router = express.Router();
const articlesControllers = require("../controllers/articlesController");
const uploader = require("../middlewares/articlePics");
const fileUpload = require("express-fileupload");

router
  .use(fileUpload())
  .get("/search", articlesControllers.searchArticles)
  .get("/", articlesControllers.getAllArticles)
  .get("/:id", articlesControllers.getArticleById)
  .post("/", uploader, articlesControllers.createNewArticle)
  .patch("/:id", uploader, articlesControllers.updateArticle)
  .delete("/:id", articlesControllers.deleteArticle);

module.exports = router;
