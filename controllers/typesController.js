const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

// @desc Get searched types
// @route GET /types/search
//! @access Public
const searchTypes = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const types = await prismadb.type.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no types

  if (!types?.length) {
    return res.status(404).json({ message: "No types found!" });
  }

  res.json(types);
};

// @desc Get an unique type
// @route GET /types/:id
//! @access Public
const getTypeById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Type ID Required!" });
  }

  //? Does the type exist?
  const type = await prismadb.type.findUnique({
    where: {
      id,
    },
  });

  if (!type) {
    return res.status(404).json({ message: "Type not found!" });
  }

  res.json(type);
};

//! @access Public
const getAllTypes = async (req, res) => {
  //* Get all types from DB

  const types = await prismadb.type.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no types

  if (!types?.length) {
    return res.status(404).json({ message: "No types found" });
  }

  res.json(types);
};

// @desc Create new type
// @route POST /types
//! @access Private
const createNewType = async (req, res) => {
  const { title } = req.body;

  //* Confirm data

  if (!title) {
    return res.status(400).json({ message: "Type title required!" });
  }

  //? Check for duplicate
  const duplicate = await prismadb.type.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Type title already exists!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Create new type

  const type = await prismadb.type.create({
    data: {
      title: capTitle,
    },
  });

  if (type) {
    //*created

    res.status(201).json({ message: `New type ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid data received!" });
  }
};

// @desc Update a type
// @route PATCH /types/:id
//! @access Private
const updateType = async (req, res) => {
  const { title } = req.body;

  const { id } = req.params;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Type ID required!" });
  }

  if (!title) {
    return res.status(400).json({ message: "Type title required!" });
  }

  //? Does the type exist to update?

  const type = await prismadb.type.findUnique({
    where: {
      id,
    },
  });

  if (!type) {
    return res.status(404).json({ message: "Type not found!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Update type

  const updatedType = await prismadb.type.update({
    where: {
      id,
    },
    data: {
      title: capTitle,
    },
  });

  res.json({ message: `Type ${updatedType.title} updated.` });
};

// @desc Delete a type
// @route DELETE /types/:id
//! @access Private
const deleteType = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Type ID required!" });
  }

  //? Does the type exist to delete?
  const type = await prismadb.type.findUnique({
    where: {
      id,
    },
  });

  if (!type) {
    return res.status(404).json({ message: "Type not found!" });
  }

  const result = await prismadb.type.delete({
    where: {
      id,
    },
  });

  res.json({
    message: `Type ${result.title} with ID: ${result.id} deleted.`,
  });
};

// @desc Delete types
// @route DELETE /types
//! @access Private
const deleteTypes = async (req, res) => {
  const { ids } = req.params;

  //* Confirm data
  if (!ids) {
    return res.status(400).json({ message: "Types IDs required!" });
  }

  //? Does the types exist to delete?
  const types = await prismadb.type.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!types) {
    return res.status(404).json({ message: "Types not found!" });
  }

  await prismadb.type.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  res.json({
    message: "Types deleted.",
  });
};

module.exports = {
  searchTypes,
  getTypeById,
  getAllTypes,
  createNewType,
  updateType,
  deleteType,
  deleteTypes,
};
