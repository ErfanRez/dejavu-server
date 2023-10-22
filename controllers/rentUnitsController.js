const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");

// @desc Get searched rentUnits
// @route GET /rent-units/search
//! @access Public
const searchRentUnits = async (req, res) => {
  const searchString = req.query.title; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const units = await prismadb.rentUnit.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
    include: {
      images: true,
      views: true,
    },
  });

  //* If no units

  if (!units?.length) {
    return res.status(400).json({ message: "No units found!" });
  }

  res.json(units);
};

// @desc Get searched rentUnits related to a specific property
// @route GET /:pId/rent-units/search
//! @access Public
const searchUnitsByPID = async (req, res) => {
  const searchString = req.query.title; //* Get the search string from query params
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
    return res.status(400).json({ message: "Property not found!" });
  }

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const units = await prismadb.rentUnit.findMany({
    where: {
      propertyId: pId,
      title: {
        contains: searchString,
      },
    },
    include: {
      images: true,
      views: true,
    },
  });

  //* If no units

  if (!units?.length) {
    return res
      .status(400)
      .json({ message: `No units related to ${property.title} found!` });
  }

  res.json(units);
};

// @desc Get all rentUnits
// @route GET /rent-units
//! @access Public
const getAllRentUnits = async (req, res) => {
  //* Get all rentUnits from DB

  const units = await prismadb.rentUnit.findMany({
    include: {
      images: true,
      views: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no units

  if (!units?.length) {
    return res.status(400).json({ message: "No units found!" });
  }

  res.json(rentUnits);
};

// @desc Get all rentUnits related to a specific property
// @route GET /:pId/rent-units
//! @access Public
const getAllUnitsByPID = async (req, res) => {
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
    return res.status(400).json({ message: "Property not found!" });
  }

  //* Get all rentUnits from DB

  const units = await prismadb.rentUnit.findMany({
    where: {
      propertyId: pId,
    },
    include: {
      images: true,
      views: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no units

  if (!units?.length) {
    return res
      .status(400)
      .json({ message: `No units related to ${property.title} found!` });
  }

  res.json(rentUnits);
};

// @desc Get an unique rentUnit
// @route GET /rent-units/:rId
//! @access Public
const getRentUnitById = async (req, res) => {
  const { rId } = req.params;

  //* Confirm data
  if (!rId) {
    return res.status(400).json({ message: "Unit ID Required!" });
  }

  //? Does the unit exist?
  const unit = await prismadb.rentUnit.findUnique({
    where: {
      id: rId,
    },
    include: {
      images: true,
      views: true,
    },
  });

  if (!unit) {
    return res.status(400).json({ message: "Unit not found!" });
  }

  res.json(unit);
};

// @desc Create new rentUnit
// @route POST /:pId/rent-units
//! @access Public
const createNewRentUnit = async (req, res) => {
  const {
    title,
    type,
    unitNo,
    floor,
    area,
    rentPrice,
    bedrooms,
    bathrooms,
    parkingCount,
    description,
    views,
  } = req.body;

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
    return res.status(400).json({ message: "Property not found!" });
  }

  // console.log(req.files);
  const convertedImages = req.convertedImages;

  //* Confirm data

  if (
    !title ||
    !type ||
    !unitNo ||
    !floor ||
    !area ||
    !rPSqft ||
    !rentPrice ||
    !bedrooms ||
    !bathrooms ||
    !parkingCount ||
    !description ||
    !views
  ) {
    res.status(400).json({ message: "All fields required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.rentUnit.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Unit title already exists!" });
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const priceDecimal = parseFloat(rentPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Create new rentUnit

  const unit = await prismadb.rentUnit.create({
    data: {
      title,
      type,
      unitNo,
      floor,
      area: areaDecimal,
      rentPrice: priceDecimal,
      bedrooms: bedroomsInt,
      bathrooms: bathroomsInt,
      parkingCount: parkingCountInt,
      description,
      propertyId: pId,
      views: {
        create: views.map((viewTitle) => ({
          title: viewTitle,
        })),
      },
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
    include: {
      images: true,
      views: true,
    },
  });

  if (unit) {
    //*created

    res.status(201).json({
      message: `New unit ${title} for property ${property.title} created.`,
    });
  } else {
    res.status(400).json({ message: "Invalid unit data received!" });
  }
};

// @desc Update a rentUnit
// @route PATCH /rent-units/:rId
//! @access Public
const updateRentUnit = async (req, res) => {
  const {
    title,
    type,
    unitNo,
    floor,
    area,
    rentPrice,
    bedrooms,
    bathrooms,
    parkingCount,
    description,
    views,
  } = req.body;

  const { rId } = req.params;

  const convertedImages = req.convertedImages;

  //* Confirm data

  if (!rId) {
    return res.status(400).json({ message: "Unit ID required!" });
  }

  if (
    !title ||
    !type ||
    !unitNo ||
    !floor ||
    !area ||
    !rPSqft ||
    !rentPrice ||
    !bedrooms ||
    !bathrooms ||
    !parkingCount ||
    !description ||
    !views
  ) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const priceDecimal = parseFloat(rentPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //? Does the unit exist to update?

  const unit = await prismadb.rentUnit.findUnique({
    where: {
      id: rId,
    },
  });

  if (!unit) {
    res.status(400).json({ message: "Unit not found!" });
  }

  // Define the path to the rentUnit's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "rents",
    unit.title
  );

  if (convertedImages) {
    fileDelete(imagesFolder);
  }

  //* Update rentUnit

  await prismadb.rentUnit.update({
    where: {
      id: rId,
    },
    data: {
      title,
      type,
      unitNo,
      floor,
      area: areaDecimal,
      rentPrice: priceDecimal,
      bedrooms: bedroomsInt,
      bathrooms: bathroomsInt,
      parkingCount: parkingCountInt,
      description,
      views: {
        deleteMany: {},
      },
      images: {
        deleteMany: {},
      },
    },
  });

  const updatedUnit = await prismadb.rentUnit.update({
    where: {
      id: rId,
    },
    data: {
      views: {
        create: views.map((viewTitle) => ({
          title: viewTitle,
        })),
      },
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
  });

  res.json({ message: `Unit ${updatedUnit.title} updated.` });
};

// @desc Delete a rentUnit
// @route DELETE /rent-units/:rId
//! @access Public
const deleteRentUnit = async (req, res) => {
  const { rId } = req.params;

  //* Confirm data
  if (!rId) {
    return res.status(400).json({ message: "Unit ID required!" });
  }

  //? Does the unit exist to delete?
  const unit = await prismadb.rentUnit.findUnique({
    where: {
      id: rId,
    },
  });

  if (!unit) {
    return res.status(400).json({ message: "Unit not found!" });
  }

  const result = await prismadb.rentUnit.delete({
    where: {
      id: rId,
    },
  });
  // Define the path to the rentUnit's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "rents",
    result.title
  );

  fileDelete(imagesFolder);

  res.json({
    message: `Unit ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchRentUnits,
  searchUnitsByPID,
  getAllRentUnits,
  getAllUnitsByPID,
  getRentUnitById,
  createNewRentUnit,
  updateRentUnit,
  deleteRentUnit,
};
