const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const fsPromises = require("fs").promises;
const fs = require("fs");

// @desc Get searched articles
// @route GET /articles/search
//! @access Private
const searchArticles = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  for (const param in searchParams) {
    if (searchParams[param]) {
      where[param] = {
        contains: searchParams[param],
      };
    }
  }

  const articles = await prismadb.article.findMany({
    where: where,
    include: {
      images: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!articles?.length) {
    return res.status(404).json({ message: "No articles found!" });
  }

  res.json(articles);
};

// @desc Get all articles
// @route GET /articles
//! @access Private
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
    return res.status(404).json({ message: "No articles found!" });
  }

  res.json(articles);
};

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
    return res.status(404).json({ message: "Article not found!" });
  }

  res.json(article);
};

// @desc Create new article
// @route POST /article
//! @access Private
const createNewArticle = async (req, res) => {
  const { title, description, body } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;

  //* Confirm data

  if (!title || !description || !body) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Check for duplicate
  const duplicate = await prismadb.article.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Article title already exists!" });
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
//! @access Private
const updateArticle = async (req, res) => {
  const { title, description, body } = req.body;

  const { id } = req.params;

  let convertedImages = req.convertedImages;

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
    return res.status(404).json({ message: "Article not found!" });
  }

  if (title !== article.title && title !== undefined) {
    const newTitle = title.match(/[a-zA-Z]+/g).join(" ");
    const oldTitle = article.title.match(/[a-zA-Z]+/g).join(" ");

    //* Check if new images provided
    if (convertedImages.length === 0) {
      await renameOldFile("articles", oldTitle, newTitle, res);

      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "articles",
        newTitle
      );

      // Check if the folder exists
      if (fs.existsSync(imagesFolder)) {
        try {
          // List all files in the folder
          const files = await fsPromises.readdir(imagesFolder);

          for (const file of files) {
            const outputImageURL = new URL(
              path.join(
                process.env.ROOT_PATH,
                "uploads",
                "images",
                "articles",
                newTitle,
                file
              )
            ).toString();

            convertedImages.push(outputImageURL);
          }

          await prismadb.article.update({
            where: {
              id,
            },
            data: {
              images: {
                deleteMany: {},
              },
            },
          });

          await prismadb.article.update({
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
        } catch (error) {
          console.error("Error reading files from folder:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    } else {
      // Define the path to the images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "articles",
        oldTitle
      );

      await fileDelete(imagesFolder, res);
    }
  } else {
    if (convertedImages.length !== 0) {
      await prismadb.article.update({
        where: {
          id,
        },
        data: {
          images: {
            deleteMany: {},
          },
        },
      });

      await prismadb.article.update({
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
    }
  }

  //* Update article

  const updatedArticle = await prismadb.article.update({
    where: {
      id,
    },
    data: {
      title,
      description,
      body,
    },
  });

  res.json({ message: `article ${updatedArticle.title} updated.` });
};

// @desc Delete a article
// @route DELETE /articles/:id
//! @access Private
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
    return res.status(404).json({ message: "Article not found!" });
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

  await fileDelete(imagesFolder);

  res.json({
    message: `Article ${result.title} with ID: ${result.id} deleted.`,
  });
};

// @desc Delete articles
// @route DELETE /articles
//! @access Private
const deleteArticles = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Article IDs required in an array!" });
  }

  for (const id of ids) {
    //? Does the article exist to delete?
    const article = await prismadb.article.findUnique({
      where: {
        id,
      },
    });

    if (!article) {
      return res
        .status(404)
        .json({ message: `Article with ID ${id} not found!` });
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

    await fileDelete(imagesFolder);
  }

  res.json({
    message: "Articles deleted successfully.",
  });
};

module.exports = {
  searchArticles,
  getArticleById,
  getAllArticles,
  createNewArticle,
  updateArticle,
  deleteArticle,
  deleteArticles,
};
