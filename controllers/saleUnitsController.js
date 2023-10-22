const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");

// @desc Get searched saleUnits
// @route GET /sale-units/search
//! @access Public
const searchSaleUnits = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const units = await prismadb.saleunit.findMany({
    where: {
      title: {
        contains: searchString,
      },
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
    return res.status(404).json({ message: "No units found!" });
  }

  res.json(units);
};

// @desc Get searched saleUnits related to a specific property
// @route GET /:pId/sale-units/search
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
    return res.status(404).json({ message: "Property not found!" });
  }

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const units = await prismadb.saleunit.findMany({
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
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no units

  if (!units?.length) {
    return res
      .status(404)
      .json({ message: `No units related to ${property.title} found!` });
  }

  res.json(units);
};

// @desc Get all saleUnits
// @route GET /sale-units
//! @access Public
const getAllSaleUnits = async (req, res) => {
  //* Get all saleUnits from DB

  const units = await prismadb.saleunit.findMany({
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

  res.json(units);
};

// @desc Get all saleUnits related to a specific property
// @route GET /:pId/sale-units
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
    return res.status(404).json({ message: "Property not found!" });
  }

  //* Get all saleUnits from DB

  const units = await prismadb.saleunit.findMany({
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
      .status(404)
      .json({ message: `No units related to ${property.title} found!` });
  }

  res.json(units);
};

// @desc Get an unique saleUnit
// @route GET /sale-units/:sId
//! @access Public
const getSaleUnitById = async (req, res) => {
  const { sId } = req.params;

  //* Confirm data
  if (!sId) {
    return res.status(400).json({ message: "Unit ID Required!" });
  }

  //? Does the unit exist?
  const unit = await prismadb.saleunit.findUnique({
    where: {
      id: sId,
    },
    include: {
      images: true,
      views: true,
    },
  });

  if (!unit) {
    return res.status(404).json({ message: "Unit not found!" });
  }

  res.json(unit);
};

// @desc Create new saleUnit
// @route POST /:pId/sale-unit
//! @access Private
const createNewSaleUnit = async (req, res) => {
  const {
    title,
    type,
    unitNo,
    floor,
    area,
    rPSqft,
    totalPrice,
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
    return res.status(404).json({ message: "Property not found!" });
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
    !totalPrice ||
    !bedrooms ||
    !bathrooms ||
    !parkingCount ||
    !description ||
    !views
  ) {
    res.status(400).json({ message: "All fields required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.saleunit.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Unit title already exists!" });
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const rpsDecimal = parseFloat(rPSqft);
  const priceDecimal = parseFloat(totalPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Create new saleUnit

  const unit = await prismadb.saleunit.create({
    data: {
      title,
      type,
      unitNo,
      floor,
      area: areaDecimal,
      rPSqft: rpsDecimal,
      totalPrice: priceDecimal,
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

// @desc Update a saleUnit
// @route PATCH /sale-units/:sId
//! @access Private
const updateSaleUnit = async (req, res) => {
  const {
    title,
    type,
    unitNo,
    floor,
    area,
    rPSqft,
    totalPrice,
    bedrooms,
    bathrooms,
    parkingCount,
    description,
    views,
  } = req.body;

  const { sId } = req.params;

  if (!sId) {
    return res.status(400).json({ message: "Unit ID required!" });
  }

  const convertedImages = req.convertedImages;

  //* Confirm data

  if (
    !title ||
    !type ||
    !unitNo ||
    !floor ||
    !area ||
    !rPSqft ||
    !totalPrice ||
    !bedrooms ||
    !bathrooms ||
    !parkingCount ||
    !description ||
    !views
  ) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Does the unit exist to update?

  const unit = await prismadb.saleunit.findUnique({
    where: {
      id: sId,
    },
  });

  if (!unit) {
    res.status(404).json({ message: "Unit not found!" });
  }

  // Define the path to the saleUnit's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "sales",
    unit.title
  );

  if (title !== unit.title || convertedImages) {
    fileDelete(imagesFolder);
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const rpsDecimal = parseFloat(rPSqft);
  const priceDecimal = parseFloat(totalPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Update saleUnit

  await prismadb.saleunit.update({
    where: {
      id: sId,
    },
    data: {
      title,
      type,
      unitNo,
      floor,
      area: areaDecimal,
      rPSqft: rpsDecimal,
      totalPrice: priceDecimal,
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

  const updatedUnit = await prismadb.saleunit.update({
    where: {
      id: sId,
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

// @desc Delete a saleUnit
// @route DELETE /:pId/sale-units/:sId
//! @access Private
const deleteSaleUnit = async (req, res) => {
  const { sId } = req.params;

  //* Confirm data
  if (!sId) {
    return res.status(400).json({ message: "Unit ID required!" });
  }

  //? Does the unit exist to delete?
  const unit = await prismadb.saleunit.findUnique({
    where: {
      id: sId,
    },
  });

  if (!unit) {
    return res.status(404).json({ message: "Unit not found!" });
  }

  const result = await prismadb.saleunit.delete({
    where: {
      id: sId,
    },
  });
  // Define the path to the saleUnit's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "sales",
    result.title
  );

  if (convertedImages) {
    fileDelete(imagesFolder);
  }

  res.json({
    message: `Unit ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchSaleUnits,
  searchUnitsByPID,
  getSaleUnitById,
  getAllSaleUnits,
  getAllUnitsByPID,
  createNewSaleUnit,
  updateSaleUnit,
  deleteSaleUnit,
};
