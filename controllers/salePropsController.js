const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const renameOldPdf = require("../utils/renameOldPdf");
const fs = require("fs");

// @desc Get searched sales
// @route GET /sales/search
//! @access Public
const searchSales = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  //* Create a map of query parameter names to their corresponding Prisma filter conditions
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

  const properties = await prismadb.saleProperty.findMany({
    where: where,
    take: limit,
    include: {
      agent: true,
      images: true,
      views: true,
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

// @desc Get all sales
// @route GET /sales
//! @access Public
const getAllSales = async (req, res) => {
  //* Get all sales from DB

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  const properties = await prismadb.saleProperty.findMany({
    take: limit,
    include: {
      agent: true,
      images: true,
      views: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no properties

  if (!properties?.length) {
    return res.status(400).json({ message: "No properties found!" });
  }

  res.json(properties);
};

// @desc Get an unique saleProperty
// @route GET /sales/:sId
//! @access Public
const getSaleById = async (req, res) => {
  const { sId } = req.params;

  //* Confirm data
  if (!sId) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  //? Does the property exist?
  const property = await prismadb.saleProperty.findUnique({
    where: {
      id: sId,
    },
    include: {
      agent: true,
      images: true,
      views: true,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "Property not found!" });
  }

  res.json(property);
};

// @desc Create new saleProperty
// @route POST /sale-property
//! @access Private
const createNewSale = async (req, res) => {
  const {
    title,
    owner,
    city,
    country,
    location,
    type,
    unitNo,
    floor,
    area,
    rPSqft,
    totalPrice,
    bedrooms,
    bathrooms,
    parkingCount,
    mapUrl,
    description,
    amenities,
    agentId,
  } = req.body;

  const pdfUrl = req.pdfUrl;
  const bluePrint = req.bluePrint;

  let { views } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;

  //* Confirm data

  if (
    !title ||
    !owner ||
    !city ||
    !country ||
    !location ||
    !type ||
    !floor ||
    !area ||
    !rPSqft ||
    !totalPrice ||
    !bedrooms ||
    !bathrooms ||
    !parkingCount ||
    !mapUrl ||
    !description ||
    !amenities ||
    !agentId ||
    !views
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

  const duplicate = await prismadb.saleProperty.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Property title already exists!" });
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

  //* Create new saleProperty

  const property = await prismadb.saleProperty.create({
    data: {
      title,
      owner,
      city,
      country,
      location,
      type,
      unitNo,
      floor,
      area: areaDecimal,
      rPSqft: rpsDecimal,
      totalPrice: priceDecimal,
      bedrooms: bedroomsInt,
      bathrooms: bathroomsInt,
      parkingCount: parkingCountInt,
      mapUrl,
      pdfUrl,
      bluePrint,
      description,
      amenities,
      agent: {
        connect: {
          id: agentId,
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

  if (property) {
    //*created

    res.status(201).json({
      message: `New property ${title} created.`,
    });
  } else {
    res.status(400).json({ message: "Invalid property data received!" });
  }
};

// @desc Update a saleProperty
// @route PATCH /sales/:sId
//! @access Private
const updateSale = async (req, res) => {
  const {
    title,
    owner,
    city,
    country,
    location,
    type,
    unitNo,
    floor,
    area,
    rPSqft,
    totalPrice,
    bedrooms,
    bathrooms,
    parkingCount,
    mapUrl,
    description,
    amenities,
  } = req.body;

  let pdfUrl = req.pdfUrl;
  let bluePrint = req.bluePrint;

  let { views } = req.body;

  const { sId } = req.params;

  if (!sId) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  let convertedImages = req.convertedImages;

  //* Confirm data

  if (!title) {
    return res.status(400).json({ message: "Title required!" });
  }

  //? Does the property exist to update?

  const property = await prismadb.saleProperty.findUnique({
    where: {
      id: sId,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "property not found!" });
  }

  if (title !== property.title && title !== undefined) {
    //* Check if new images provided
    if (convertedImages.length === 0) {
      renameOldFile("sales", property.title, title);

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
      const pdfFile = path.join(
        __dirname,
        "..",
        "uploads",
        "factSheets",
        `${property.title}.pdf`
      );

      fileDelete(pdfFile);
    }

    //* Check if new blueprint provided
    if (!bluePrint) {
      renameOldFile("bluePrints", `${property.title}.webp`, `${title}.webp`);

      const newBluePrint = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "images",
          "bluePrints",
          `${title}.webp`
        )
      ).toString();

      bluePrint = newBluePrint;
    } else {
      // Define the path to the factSheets folder
      const bluePrintFile = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "bluePrints",
        `${property.title}.webp`
      );

      fileDelete(bluePrintFile);
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

  //* Update saleProperty

  await prismadb.saleProperty.update({
    where: {
      id: sId,
    },
    data: {
      title,
      owner,
      city,
      country,
      location,
      type,
      unitNo,
      floor,
      area: areaDecimal,
      rPSqft: rpsDecimal,
      totalPrice: priceDecimal,
      bedrooms: bedroomsInt,
      bathrooms: bathroomsInt,
      parkingCount: parkingCountInt,
      mapUrl,
      pdfUrl,
      bluePrint,
      description,
      amenities,
      views: {
        deleteMany: {},
      },
      images: {
        deleteMany: {},
      },
    },
  });

  const updatedProperty = await prismadb.saleProperty.update({
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

  res.json({ message: `Property ${updatedProperty.title} updated.` });
};

// @desc Update a property
// @route PATCH /rents/:rId
//! @access Private
const updatePropertyAgent = async (req, res) => {
  const { sId } = req.params;
  const { agentId } = req.body;

  // Confirm data
  if (!agentId) {
    return res.status(400).json({ message: "Agent ID is required!" });
  }

  // Check if the property exists
  const existingProperty = await prismadb.saleProperty.findUnique({
    where: {
      id: sId,
    },
    include: {
      agent: true,
    },
  });

  if (!existingProperty) {
    return res.status(404).json({ message: "Property not found!" });
  }

  // Check if the new agent exists
  const newAgent = await prismadb.agent.findUnique({
    where: {
      id: agentId,
    },
  });

  if (!newAgent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  // Update the property with the new agent
  const updatedProperty = await prismadb.saleProperty.update({
    where: {
      id: propertyId,
    },
    data: {
      agent: {
        connect: {
          id: agentId,
        },
      },
    },
  });

  if (updatedProperty) {
    res.status(200).json({
      message: `Agent for property ${existingProperty.title} updated.`,
    });
  } else {
    res.status(400).json({ message: "Failed to update property agent." });
  }
};

// @desc Delete a saleProperty
// @route DELETE /sales/:sId
//! @access Private
const deleteSale = async (req, res) => {
  const { sId } = req.params;

  //* Confirm data
  if (!sId) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  //? Does the property exist to delete?
  const property = await prismadb.saleProperty.findUnique({
    where: {
      id: sId,
    },
  });

  if (!property) {
    return res.status(404).json({ message: "property not found!" });
  }

  const result = await prismadb.saleProperty.delete({
    where: {
      id: sId,
    },
  });
  // Define the path to the saleProperty's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "sales",
    result.title
  );

  fileDelete(imagesFolder);

  // Define the path to the property's pdf file
  const pdfFile = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    `${result.title}.pdf`
  );

  fileDelete(pdfFile);

  // Define the path to the property's bluePrint image
  const bluePrintFile = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "bluePrints",
    `${result.title}.webp`
  );

  fileDelete(bluePrintFile);

  res.json({
    message: `Property ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchSales,
  getSaleById,
  getAllSales,
  createNewSale,
  updateSale,
  updatePropertyAgent,
  deleteSale,
};
