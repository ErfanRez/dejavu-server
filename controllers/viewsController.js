const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

// @desc Get searched views
// @route GET /views/search
//! @access Public
const searchViews = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const views = await prismadb.view.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no views

  if (!views?.length) {
    return res.status(404).json({ message: "No views found!" });
  }

  res.json(views);
};

// @desc Get an unique view
// @route GET /views/:id
//! @access Public
const getViewById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "View ID Required!" });
  }

  //? Does the view exist?
  const view = await prismadb.view.findUnique({
    where: {
      id,
    },
  });

  if (!view) {
    return res.status(404).json({ message: "View not found!" });
  }

  res.json(view);
};

//! @access Public
const getAllViews = async (req, res) => {
  //* Get all views from DB

  const views = await prismadb.view.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no views

  if (!views?.length) {
    return res.status(404).json({ message: "No views found" });
  }

  res.json(views);
};

// @desc Create new view
// @route POST /views
//! @access Private
const createNewView = async (req, res) => {
  const { title } = req.body;

  //* Confirm data

  if (!title) {
    return res.status(400).json({ message: "View title required!" });
  }

  //? Check for duplicate
  const duplicate = await prismadb.view.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "View title already exists!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Create new view

  const view = await prismadb.view.create({
    data: {
      title: capTitle,
    },
  });

  if (view) {
    //*created

    res.status(201).json({ message: `New view ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid data received!" });
  }
};

// @desc Update a view
// @route PATCH /views/:id
//! @access Private
const updateView = async (req, res) => {
  const { title } = req.body;

  const { id } = req.params;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "View ID required!" });
  }

  if (!title) {
    return res.status(400).json({ message: "View title required!" });
  }

  //? Does the view exist to update?

  const view = await prismadb.view.findUnique({
    where: {
      id,
    },
  });

  if (!view) {
    return res.status(404).json({ message: "View not found!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Update view

  const updatedView = await prismadb.view.update({
    where: {
      id,
    },
    data: {
      title: capTitle,
    },
  });

  res.json({ message: `View ${updatedView.title} updated.` });
};

// @desc Delete a view
// @route DELETE /views/:id
//! @access Private
const deleteView = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "View ID required!" });
  }

  //? Does the view exist to delete?
  const view = await prismadb.view.findUnique({
    where: {
      id,
    },
  });

  if (!view) {
    return res.status(404).json({ message: "View not found!" });
  }

  const result = await prismadb.view.delete({
    where: {
      id,
    },
  });

  res.json({
    message: `View ${result.title} with ID: ${result.id} deleted.`,
  });
};

// @desc Delete views
// @route DELETE /views
//! @access Private
const deleteViews = async (req, res) => {
  const { ids } = req.params;

  //* Confirm data
  if (!ids) {
    return res.status(400).json({ message: "Views IDs required!" });
  }

  //? Does the views exist to delete?
  const views = await prismadb.view.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!views) {
    return res.status(404).json({ message: "Views not found!" });
  }

  await prismadb.view.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  res.json({
    message: "Views deleted.",
  });
};

module.exports = {
  searchViews,
  getViewById,
  getAllViews,
  createNewView,
  updateView,
  deleteView,
  deleteViews,
};
