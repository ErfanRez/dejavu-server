const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

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
    return res.status(404).json({ message: "No types found!" });
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

  //* Converts

  const capTitle = capitalize(title);

  //? Check for duplicate
  const duplicate = await prismadb.type.findUnique({
    where: {
      title: capTitle,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Type title already exists!" });
  }

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

  //* Converts

  const capTitle = capitalize(title);

  //? Does the type exist to update?

  const type = await prismadb.type.findUnique({
    where: {
      id,
    },
  });

  if (!type) {
    return res.status(404).json({ message: "Type not found!" });
  }

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
  const { ids } = req.body;

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
  getTypeById,
  getAllTypes,
  createNewType,
  updateType,
  deleteType,
  deleteTypes,
};
