const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

// @desc Get searched categories
// @route GET /categories/search
//! @access Public
const searchCategories = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const categories = await prismadb.category.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
  });

  //* If no categories

  if (!categories?.length) {
    return res.status(404).json({ message: "No categories found!" });
  }

  res.json(categories);
};

//! @access Public
const getAllCategories = async (req, res) => {
  //* Get all categories from DB

  const categories = await prismadb.category.findMany({});

  //* If no categories

  if (!categories?.length) {
    return res.status(404).json({ message: "No categories found!" });
  }

  res.json(categories);
};

// @desc Get an unique category
// @route GET /categories/:id
//! @access Public
const getCategoryById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Category ID Required!" });
  }

  //? Does the category exist?
  const category = await prismadb.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found!" });
  }

  res.json(category);
};

// @desc Create new category
// @route POST /categories
//! @access Private
const createNewCategory = async (req, res) => {
  const { title } = req.body;

  //* Confirm data

  if (!title) {
    return res.status(400).json({ message: "Category title required!" });
  }

  //? Check for duplicate
  const duplicate = await prismadb.category.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Category title already exists!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Create new category

  const category = await prismadb.category.create({
    data: {
      title: capTitle,
    },
  });

  if (category) {
    //*created

    res.status(201).json({ message: `New category ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid data received!" });
  }
};

// @desc Update a category
// @route PATCH /properties/:id
//! @access Private
const updateCategory = async (req, res) => {
  const { title } = req.body;

  const { id } = req.params;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Category ID required!" });
  }

  if (!title) {
    return res.status(400).json({ message: "Category title required!" });
  }

  //? Does the category exist to update?

  const category = await prismadb.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Update category

  const updatedCategory = await prismadb.category.update({
    where: {
      id,
    },
    data: {
      title: capTitle,
    },
  });

  res.json({ message: `Category ${updatedCategory.title} updated.` });
};

// @desc Delete a category
// @route DELETE /properties/:id
//! @access Private
const deleteCategory = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Category ID required!" });
  }

  //? Does the category exist to delete?
  const category = await prismadb.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found!" });
  }

  const result = await prismadb.category.delete({
    where: {
      id,
    },
  });

  res.json({
    message: `Category ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchCategories,
  getCategoryById,
  getAllCategories,
  createNewCategory,
  updateCategory,
  deleteCategory,
};
