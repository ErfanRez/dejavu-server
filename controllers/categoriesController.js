const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

//! @access Public
const getAllCategories = async (req, res) => {
  //* Get all categories from DB

  const categories = await prismadb.category.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

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

  //* Converts

  const capTitle = capitalize(title);

  //? Check for duplicate
  const duplicate = await prismadb.category.findUnique({
    where: {
      title: capTitle,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Category title already exists!" });
  }

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

  //* Converts

  const capTitle = capitalize(title);

  //? Does the category exist to update?

  const category = await prismadb.category.findUnique({
    where: {
      id,
    },
  });

  if (!category) {
    return res.status(404).json({ message: "Category not found!" });
  }

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

// @desc Delete categories
// @route DELETE /categories
//! @access Private
const deleteCategories = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids) {
    return res.status(400).json({ message: "Categories IDs required!" });
  }

  //? Does the categories exist to delete?
  const categories = await prismadb.category.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!categories) {
    return res.status(404).json({ message: "Categories not found!" });
  }

  await prismadb.category.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  res.json({
    message: "Categories deleted.",
  });
};

module.exports = {
  getCategoryById,
  getAllCategories,
  createNewCategory,
  updateCategory,
  deleteCategory,
  deleteCategories,
};
