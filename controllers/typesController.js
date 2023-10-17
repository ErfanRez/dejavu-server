const prismadb = require("../lib/prismadb");

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
    return res.status(400).json({ message: "No types found" });
  }

  res.json(types);
};

// @desc Create new type
// @route POST /types
//! @access Public
const createNewType = async (req, res) => {
  const { title } = req.body;

  //* Confirm data

  if (!title) {
    res.status(400).json({ message: "Type title required!" });
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

  //* Create new type

  const type = await prismadb.type.create({
    data: {
      title,
    },
  });

  if (type) {
    //*created

    res.status(201).json({ message: `New type ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid type data received!" });
  }
};

// @desc Update a type
// @route PATCH /properties/:id
//! @access Public
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
    res.status(400).json({ message: "Type not found!" });
  }

  //* Update type

  const updatedType = await prismadb.type.update({
    where: {
      id,
    },
    data: {
      title,
    },
  });

  res.json({ message: `type ${updatedType.title} updated.` });
};

// @desc Delete a type
// @route DELETE /properties/:id
//! @access Public
const deleteType = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Type ID required!" });
  }

  //* Does the type exist to delete?
  const type = await prismadb.type.findUnique({
    where: {
      id,
    },
  });

  if (!type) {
    return res.status(400).json({ message: "Type not found!" });
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

module.exports = {
  getAllTypes,
  createNewType,
  updateType,
  deleteType,
};
