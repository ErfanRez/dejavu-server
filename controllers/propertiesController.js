const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");

// @desc Get searched properties
// @route GET /properties/search
//! @access Public
const searchProperties = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const properties = await prismadb.property.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
    include: {
      images: true,
      amenities: true,
      saleUnits: true,
      rentUnits: true,
      installments: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no properties

  if (!properties?.length) {
    return res.status(404).json({ message: "No properties found!" });
  }

  res.json(properties);
};

// @desc Get an unique property
// @route GET /properties/:pId
//! @access Public
const getPropertyById = async (req, res) => {
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
    include: {
      images: true,
      amenities: true,
      saleUnits: true,
      rentUnits: true,
      installments: true,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "Property not found!" });
  }

  res.json(property);
};

// @desc Get all properties
// @route GET /properties
//! @access Public
const getAllProperties = async (req, res) => {
  //* Get all properties from DB

  const properties = await prismadb.property.findMany({
    include: {
      images: true,
      amenities: true,
      saleUnits: true,
      rentUnits: true,
      installments: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no properties

  if (!properties?.length) {
    return res.status(404).json({ message: "No properties found!" });
  }

  res.json(properties);
};

// @desc Create new property
// @route POST /property
//! @access Private
const createNewProperty = async (req, res) => {
  const {
    title,
    developer,
    city,
    country,
    location,
    category,
    latitude,
    longitude,
    offPlan,
    completionDate,
    description,
  } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;
  const pdfUrl = req.pdfUrl;

  //* Confirm data

  if (
    !title ||
    !developer ||
    !city ||
    !country ||
    !location ||
    !category ||
    !latitude ||
    !longitude ||
    !description
  ) {
    res.status(400).json({ message: "All fields required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.property.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Property title already exists!" });
  }

  //* converts

  offPlan
    ? (offPlanBoolean = JSON.parse(offPlan))
    : (offPlanBoolean = undefined);

  //* Create new property

  const property = await prismadb.property.create({
    data: {
      title,
      developer,
      city,
      country,
      location,
      category,
      latitude,
      longitude,
      offPlan: offPlanBoolean,
      completionDate,
      description,
      pdfUrl,
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
    include: {
      images: true,
      amenities: true,
      saleUnits: true,
      rentUnits: true,
      installments: true,
    },
  });

  if (property) {
    //*created

    res.status(201).json({ message: `New property ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid property data received!" });
  }
};

// @desc Update a property
// @route PATCH /properties/:pId
//! @access Private
const updateProperty = async (req, res) => {
  const {
    title,
    developer,
    city,
    country,
    location,
    category,
    latitude,
    longitude,
    offPlan,
    completionDate,
    description,
  } = req.body;

  const { pId } = req.params;

  const convertedImages = req.convertedImages;
  const pdfUrl = req.pdfUrl;

  //* Confirm data

  if (!pId) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  if (
    !title ||
    !developer ||
    !city ||
    !country ||
    !location ||
    !category ||
    !latitude ||
    !longitude ||
    !description
  ) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Does the property exist to update?

  const property = await prismadb.property.findUnique({
    where: {
      id: pId,
    },
  });

  if (!property) {
    res.status(404).json({ message: "Property not found!" });
  }

  // Define the path to the property's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "properties",
    property.title
  );

  if (convertedImages) {
    fileDelete(imagesFolder);
  }

  // Define the path to the property's images folder
  const pdfFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    `${property.title}.pdf`
  );

  if (pdfUrl) {
    fileDelete(pdfFolder);
  }

  //* converts

  offPlan
    ? (offPlanBoolean = JSON.parse(offPlan))
    : (offPlanBoolean = undefined);

  //* Update property

  await prismadb.property.update({
    where: {
      id: pId,
    },
    data: {
      title,
      developer,
      city,
      country,
      location,
      category,
      latitude,
      longitude,
      offPlan: offPlanBoolean,
      completionDate,
      description,
      pdfUrl,
      images: {
        deleteMany: {},
      },
    },
  });

  const updatedProperty = await prismadb.property.update({
    where: {
      id: pId,
    },
    data: {
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
  });

  res.json({ message: `property ${updatedProperty.title} updated.` });
};

// @desc Delete a property
// @route DELETE /properties/:pId
//! @access Private
const deleteProperty = async (req, res) => {
  const { pId } = req.params;

  //* Confirm data
  if (!pId) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  //? Does the property exist to delete?
  const property = await prismadb.property.findUnique({
    where: {
      id: pId,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "Property not found!" });
  }

  const result = await prismadb.property.delete({
    where: {
      id: pId,
    },
  });

  // Define the path to the property's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "properties",
    result.title
  );

  fileDelete(imagesFolder);

  // Define the path to the property's images folder
  const pdfFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    `${result.title}.pdf`
  );

  fileDelete(pdfFolder);

  res.json({
    message: `Property ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchProperties,
  getPropertyById,
  getAllProperties,
  createNewProperty,
  updateProperty,
  deleteProperty,
};
