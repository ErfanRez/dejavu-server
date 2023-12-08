const prismadb = require("../lib/prismadb");
const capitalize = require("../utils/capitalizer");

// @desc Get searched amenities
// @route GET /amenities/search
//! @access Private
const searchAmenities = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const amenities = await prismadb.amenity.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no amenities

  if (!amenities?.length) {
    return res.status(404).json({ message: "No amenities found!" });
  }

  res.json(amenities);
};

// @desc Get all amenities
// @route GET /amenities
//! @access Private
const getAllAmenities = async (req, res) => {
  //* Get all amenities from DB

  const amenities = await prismadb.amenity.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no amenities

  if (!amenities?.length) {
    return res.status(404).json({ message: "No amenities found!" });
  }

  res.json(amenities);
};

// @desc Get an unique amenity
// @route GET /amenities/:id
//! @access Public
const getAmenityById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Amenity ID Required!" });
  }

  //? Does the amenity exist?
  const amenity = await prismadb.amenity.findUnique({
    where: {
      id,
    },
  });

  if (!amenity) {
    return res.status(404).json({ message: "Amenity not found!" });
  }

  res.json(amenity);
};

// @desc Create new amenity
// @route POST /:pId/amenities
//! @access Private
const createNewAmenity = async (req, res) => {
  const { title } = req.body;

  //* Confirm data

  if (!title) {
    return res.status(400).json({ message: "Amenity title required!" });
  }

  //? Check for duplicate
  const duplicate = await prismadb.amenity.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Amenity title already exists!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Create new amenity

  const amenity = await prismadb.amenity.create({
    data: {
      title: capTitle,
    },
  });

  if (amenity) {
    //*created

    res.status(201).json({ message: `New amenity ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid data received!" });
  }
};

// @desc Update a amenity
// @route PATCH /amenities/:id
//! @access Private
const updateAmenity = async (req, res) => {
  const { title } = req.body;

  const { id } = req.params;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Amenity ID required!" });
  }

  if (!title) {
    return res.status(400).json({ message: "Amenity title required!" });
  }

  //? Check for duplicate
  const duplicate = await prismadb.amenity.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Amenity title already exists!" });
  }

  //? Does the amenity exist to update?

  const amenity = await prismadb.amenity.findUnique({
    where: {
      id,
    },
  });

  if (!amenity) {
    return res.status(404).json({ message: "Amenity not found!" });
  }

  //* Converts

  const capTitle = capitalize(title);

  //* Update amenity

  const updatedAmenity = await prismadb.amenity.update({
    where: {
      id,
    },
    data: {
      title: capTitle,
    },
  });

  res.json({ message: `Amenity ${updatedAmenity.title} updated.` });
};

// @desc Delete a amenity
// @route DELETE /amenities/:id
//! @access Private
const deleteAmenity = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Amenity ID required!" });
  }

  //? Does the amenity exist to delete?
  const amenity = await prismadb.amenity.findUnique({
    where: {
      id,
    },
  });

  if (!amenity) {
    return res.status(404).json({ message: "Amenity not found!" });
  }

  const result = await prismadb.amenity.delete({
    where: {
      id,
    },
  });

  res.json({
    message: `Amenity ${result.title} with ID: ${result.id} deleted.`,
  });
};

// @desc Delete a amenity
// @route DELETE /amenities
//! @access Private
const deleteAmenities = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids) {
    return res.status(400).json({ message: "Amenities IDs required!" });
  }

  //? Does the amenities exist to delete?
  const amenities = await prismadb.amenity.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!amenities) {
    return res.status(404).json({ message: "Amenities not found!" });
  }

  await prismadb.amenity.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  res.json({
    message: "Amenities deleted.",
  });
};

module.exports = {
  searchAmenities,
  getAllAmenities,
  getAmenityById,
  createNewAmenity,
  updateAmenity,
  deleteAmenity,
  deleteAmenities,
};
