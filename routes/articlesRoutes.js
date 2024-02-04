const express = require("express");
const router = express.Router();
const articlesControllers = require("../controllers/articlesController");
const uploader = require("../middlewares/articlePics");
const fileUpload = require("express-fileupload");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .use(fileUpload())
  .get("/search", articlesControllers.searchArticles)
  .get("/", articlesControllers.getAllArticles)
  .get("/:id", articlesControllers.getArticleById)
  .use(verifyJWT)
  .post("/", uploader, articlesControllers.createNewArticle)
  .patch("/:id", uploader, articlesControllers.updateArticle)
  .delete("/:id", articlesControllers.deleteArticle)
  .delete("/", articlesControllers.deleteArticles);

module.exports = router;
