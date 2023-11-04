const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const renameOldPdf = require("../utils/renameOldPdf");
const fs = require("fs");

// @desc Get searched properties
// @route GET /properties/search
//! @access Public
const searchProperties = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  for (const param in searchParams) {
    if (searchParams[param]) {
      where[param] = {
        contains: searchParams[param],
      };
    }
  }

  const properties = await prismadb.property.findMany({
    where: where,
    take: limit,
    include: {
      agent: true,
      images: true,
      amenities: true,
      installments: true,
      saleUnits: true,
      rentUnits: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

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
      agent: true,
      images: true,
      amenities: true,
      installments: true,
      saleUnits: true,
      rentUnits: true,
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

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  const properties = await prismadb.property.findMany({
    take: limit,
    include: {
      agent: true,
      images: true,
      amenities: true,
      installments: true,
      saleUnits: true,
      rentUnits: true,
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
    owner,
    city,
    country,
    location,
    category,
    mapUrl,
    offPlan,
    completionDate,
    description,
    agentId,
  } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;
  const pdfUrl = req.pdfUrl;

  //* Confirm data

  if (
    !title ||
    !owner ||
    !city ||
    !country ||
    !location ||
    !category ||
    !mapUrl ||
    !description ||
    !agentId
  ) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Does the agent exist?
  const agent = await prismadb.agent.findUnique({
    where: {
      id: agentId,
    },
  });

  if (!agent) {
    return res.status(404).json({ message: "Agent not found!" });
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
      owner,
      city,
      country,
      location,
      category,
      mapUrl,
      offPlan: offPlanBoolean,
      completionDate,
      description,
      pdfUrl,
      agent: {
        connect: {
          id: agentId,
        },
      },
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
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
    owner,
    city,
    country,
    location,
    category,
    mapUrl,
    offPlan,
    completionDate,
    description,
  } = req.body;

  const { pId } = req.params;

  let convertedImages = req.convertedImages;
  let pdfUrl = req.pdfUrl;

  //* Confirm data

  if (!pId) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  if (
    !title ||
    !owner ||
    !city ||
    !country ||
    !location ||
    !category ||
    !mapUrl ||
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
    return res.status(404).json({ message: "Property not found!" });
  }

  if (title !== property.title && title !== undefined) {
    //* Check if new images provided
    if (convertedImages.length === 0) {
      renameOldFile("properties", property.title, title);

      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "properties",
        title
      );

      // Check if the folder exists
      if (fs.existsSync(imagesFolder)) {
        // List all files in the folder
        const files = fs.readdirSync(imagesFolder);

        // Create an array of file paths
        const outputImageURL = new URL(
          path.join(
            process.env.ROOT_PATH,
            "uploads",
            "images",
            "properties",
            title
          )
        ).toString();

        convertedImages = files.map((file) => path.join(outputImageURL, file));
      }
    } else {
      // Define the path to the property's images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "properties",
        property.title
      );

      fileDelete(imagesFolder);
    }

    //* Check if new pdf provided
    if (!pdfUrl) {
      renameOldPdf(`${property.title}.pdf`, `${title}.pdf`);

      const newPdfPath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "factSheets",
          `${title}.pdf`
        )
      ).toString();

      pdfUrl = newPdfPath;
    } else {
      // Define the path to the factSheets folder
      const pdfFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "factSheets",
        `${property.title}.pdf`
      );

      fileDelete(pdfFolder);
    }
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
      owner,
      city,
      country,
      location,
      category,
      mapUrl,
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
