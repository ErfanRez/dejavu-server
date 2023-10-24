const prismadb = require("../lib/prismadb");

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

// @desc Get searched amenities related to a specific property
// @route GET /:pId/amenities/search
//! @access Public
const searchAmenitiesByPID = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params
  const { pId } = req.params;

  //* Confirm data
  if (!pId) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  //? Does the property exist?
  const property = await prismadb.property.findUnique({
    where: {
      id: pId,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "Property not found!" });
  }

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const amenities = await prismadb.amenity.findMany({
    where: {
      propertyId: pId,
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
    return res
      .status(404)
      .json({ message: `No amenities related to ${property.title} found!` });
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

// @desc Get all amenities related to a specific property
// @route GET /:pId/amenities
//! @access Public
const getAllAmenitiesByPID = async (req, res) => {
  const { pId } = req.params;

  //* Confirm data
  if (!pId) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  //? Does the property exist?
  const property = await prismadb.property.findUnique({
    where: {
      id: pId,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "Property not found!" });
  }

  //* Get all amenities from DB

  const amenities = await prismadb.amenity.findMany({
    where: {
      propertyId: pId,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no amenities

  if (!amenities?.length) {
    return res
      .status(404)
      .json({ message: `No amenities related to ${property.title} found!` });
  }

  res.json(amenities);
};

// @desc Get an unique amenity
// @route GET /amenities/:aId
//! @access Public
const getAmenityById = async (req, res) => {
  const { aId } = req.params;

  //* Confirm data
  if (!aId) {
    return res.status(400).json({ message: "Amenity ID Required!" });
  }

  //? Does the amenity exist?
  const amenity = await prismadb.amenity.findUnique({
    where: {
      id: aId,
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
  const { titles } = req.body;

  const { pId } = req.params;

  if (!pId) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  //? Does the property exist?
  const property = await prismadb.property.findUnique({
    where: {
      id: pId,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "Property not found!" });
  }

  //* Confirm data

  if (!titles) {
    return res.status(400).json({ message: "Amenity titles required!" });
  }

  //* Create new amenity

  const amenity = await prismadb.amenity.create({
    data: {
      title: {
        create: titles.map((amenityTitle) => ({
          title: amenityTitle,
        })),
      },
      property: {
        connect: {
          id: pId,
        },
      },
    },
  });

  if (amenity) {
    //*created

    res.status(201).json({
      message: `New amenities for property ${property.title} created.`,
    });
  } else {
    res.status(400).json({ message: "Invalid amenity data received!" });
  }
};

// @desc Update a amenity
// @route PATCH /amenities/:aId
//! @access Private
const updateAmenity = async (req, res) => {
  const { title } = req.body;

  const { aId } = req.params;

  //* Confirm data

  if (!aId) {
    return res.status(400).json({ message: "Amenity ID required!" });
  }

  if (!title) {
    return res.status(400).json({ message: "Amenity title required!" });
  }

  //? Does the amenity exist to update?

  const amenity = await prismadb.amenity.findUnique({
    where: {
      id: aId,
    },
  });

  if (!amenity) {
    return res.status(404).json({ message: "Amenity not found!" });
  }

  //* Update amenity

  const updatedAmenity = await prismadb.amenity.update({
    where: {
      id: aId,
    },
    data: {
      title,
    },
  });

  res.json({ message: `Amenity ${updatedAmenity.title} updated.` });
};

// @desc Delete a amenity
// @route DELETE /amenities/:aId
//! @access Private
const deleteAmenity = async (req, res) => {
  const { aId } = req.params;

  //* Confirm data
  if (!aId) {
    return res.status(400).json({ message: "Amenity ID required!" });
  }

  //? Does the amenity exist to delete?
  const amenity = await prismadb.amenity.findUnique({
    where: {
      id: aId,
    },
  });

  if (!amenity) {
    return res.status(404).json({ message: "Amenity not found!" });
  }

  const result = await prismadb.amenity.delete({
    where: {
      id: aId,
    },
  });

  res.json({
    message: `Amenity ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchAmenities,
  searchAmenitiesByPID,
  getAllAmenities,
  getAllAmenitiesByPID,
  getAmenityById,
  createNewAmenity,
  updateAmenity,
  deleteAmenity,
};
