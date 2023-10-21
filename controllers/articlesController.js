const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");

// @desc Get an unique article
// @route GET /articles/:id
//! @access Public
const getArticleById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Article ID Required!" });
  }

  //? Does the article exist?
  const article = await prismadb.article.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
    },
  });

  if (!article) {
    return res.status(400).json({ message: "Article not found!" });
  }

  res.json(article);
};

// @desc Get all articles
// @route GET /articles
//! @access Public
const getAllArticles = async (req, res) => {
  //* Get all articles from DB

  const articles = await prismadb.article.findMany({
    include: {
      images: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no articles

  if (!articles?.length) {
    return res.status(400).json({ message: "No articles found!" });
  }

  res.json(articles);
};

// @desc Create new article
// @route POST /article
//! @access Public
const createNewArticle = async (req, res) => {
  const { title, description, body } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;

  //* Confirm data

  if (!title || !description || !body) {
    res.status(400).json({ message: "All fields required!" });
  }

  //* Create new article

  const article = await prismadb.article.create({
    data: {
      title,
      description,
      body,
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
    include: {
      images: true,
    },
  });

  if (article) {
    //*created

    res.status(201).json({ message: `New article ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid article data received!" });
  }
};

// @desc Update a article
// @route PATCH /articles/:id
//! @access Public
const updateArticle = async (req, res) => {
  const { title, description, body } = req.body;

  const { id } = req.params;

  const convertedImages = req.convertedImages;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Article ID required!" });
  }

  if (!title || !description || !body) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Does the article exist to update?

  const article = await prismadb.article.findUnique({
    where: {
      id,
    },
  });

  if (!article) {
    res.status(400).json({ message: "Article not found!" });
  }

  // Define the path to the article's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "articles",
    result.title
  );

  fileDelete(imagesFolder);

  //* Update article

  await prismadb.article.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      body,
      images: {
        deleteMany: {},
      },
    },
  });

  const updatedArticle = await prismadb.article.update({
    where: {
      id,
    },
    data: {
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
  });

  res.json({ message: `article ${updatedArticle.title} updated.` });
};

// @desc Delete a article
// @route DELETE /articles/:id
//! @access Public
const deleteArticle = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Article ID required!" });
  }

  //? Does the article exist to delete?
  const article = await prismadb.article.findUnique({
    where: {
      id,
    },
  });

  if (!article) {
    return res.status(400).json({ message: "Article not found!" });
  }

  const result = await prismadb.article.delete({
    where: {
      id,
    },
  });

  // Define the path to the article's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "articles",
    result.title
  );

  fileDelete(imagesFolder);

  res.json({
    message: `Article ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  getArticleById,
  getAllArticles,
  createNewArticle,
  updateArticle,
  deleteArticle,
};
