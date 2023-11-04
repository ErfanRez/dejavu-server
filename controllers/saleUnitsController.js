const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const fs = require("fs");

// @desc Get searched saleUnits
// @route GET /sale-units/search
//! @access Public
const searchSaleUnits = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  // Create a map of query parameter names to their corresponding Prisma filter conditions
  const filterMap = {
    title: { contains: searchParams.title },
    type: { contains: searchParams.type },
    area: { lte: parseFloat(searchParams.area) },
    totalPrice: { lte: parseFloat(searchParams.totalPrice) },
    rPSqft: { lte: parseFloat(searchParams.rPSqft) },
    bedrooms: { gte: parseInt(searchParams.bedrooms) },
    bathrooms: { gte: parseInt(searchParams.bathrooms) },
  };

  for (const param in searchParams) {
    if (searchParams[param] && filterMap[param]) {
      where[param] = filterMap[param];
    }
  }

  const units = await prismadb.saleUnit.findMany({
    where: where,
    take: limit,
    include: {
      property: {
        // Include the related property
        select: {
          location: true,
          city: true,
          country: true,
          agent: true,
        },
        images: true,
        views: true,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!units?.length) {
    return res.status(404).json({ message: "No units found!" });
  }

  res.json(units);
};

// @desc Get searched saleUnits related to a specific property
// @route GET /:pId/sale-units/search
//! @access Public
const searchUnitsByPID = async (req, res) => {
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

  const units = await prismadb.saleUnit.findMany({
    where: {
      propertyId: pId,
      title: {
        contains: searchString,
      },
    },
    include: {
      property: {
        // Include the related property
        select: {
          location: true,
          city: true,
          country: true,
          agent: true,
        },
      },
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
      .json({ message: `No units found related to ${property.title}!` });
  }

  res.json(units);
};

// @desc Get all saleUnits
// @route GET /sale-units
//! @access Public
const getAllSaleUnits = async (req, res) => {
  //* Get all saleUnits from DB

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  const units = await prismadb.saleUnit.findMany({
    take: limit,
    include: {
      property: {
        // Include the related property
        select: {
          location: true,
          city: true,
          country: true,
          agent: true,
        },
      },
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

  const units = await prismadb.saleUnit.findMany({
    where: {
      propertyId: pId,
    },
    include: {
      property: {
        // Include the related property
        select: {
          location: true,
          city: true,
          country: true,
          agent: true,
        },
      },
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
      .json({ message: `No units found related to ${property.title}!` });
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
  const unit = await prismadb.saleUnit.findUnique({
    where: {
      id: sId,
    },
    include: {
      property: {
        // Include the related property
        select: {
          location: true,
          city: true,
          country: true,
          agent: true,
        },
      },
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
  } = req.body;

  let { views } = req.body;

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
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.saleUnit.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Unit title already exists!" });
  }

  //* Check the type of 'views' property
  if (!Array.isArray(views)) {
    //* If 'views' is not an array, create an array with the single value
    views = [views];
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const rpsDecimal = parseFloat(rPSqft);
  const priceDecimal = parseFloat(totalPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Create new saleUnit

  const unit = await prismadb.saleUnit.create({
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
      property: {
        connect: {
          id: pId,
        },
      },
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
  } = req.body;

  let { views } = req.body;

  const { sId } = req.params;

  if (!sId) {
    return res.status(400).json({ message: "Unit ID required!" });
  }

  let convertedImages = req.convertedImages;

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

  const unit = await prismadb.saleUnit.findUnique({
    where: {
      id: sId,
    },
  });

  if (!unit) {
    return res.status(404).json({ message: "Unit not found!" });
  }

  if (title !== unit.title && title !== undefined) {
    //* Check if new images provided
    if (convertedImages.length === 0) {
      renameOldFile("sales", unit.title, title);

      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "sales",
        title
      );

      // Check if the folder exists
      if (fs.existsSync(imagesFolder)) {
        // List all files in the folder
        const files = fs.readdirSync(imagesFolder);

        // Create an array of file paths
        const outputImageURL = new URL(
          path.join(process.env.ROOT_PATH, "uploads", "images", "sales", title)
        ).toString();

        convertedImages = files.map((file) => path.join(outputImageURL, file));
      }
    } else {
      // Define the path to the images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "sales",
        unit.title
      );

      fileDelete(imagesFolder);
    }
  }

  //* Check the type of 'views' property
  if (!Array.isArray(views)) {
    //* If 'views' is not an array, create an array with the single value
    views = [views];
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const rpsDecimal = parseFloat(rPSqft);
  const priceDecimal = parseFloat(totalPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Update saleUnit

  await prismadb.saleUnit.update({
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

  const updatedUnit = await prismadb.saleUnit.update({
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
  const unit = await prismadb.saleUnit.findUnique({
    where: {
      id: sId,
    },
  });

  if (!unit) {
    return res.status(404).json({ message: "Unit not found!" });
  }

  const result = await prismadb.saleUnit.delete({
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

  fileDelete(imagesFolder);

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
