const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const renameOldPdf = require("../utils/renameOldPdf");
const fsPromises = require("fs").promises;
const fs = require("fs");
const capitalize = require("../utils/capitalizer");

// @desc Get searched sales
// @route GET /sales/search
//! @access Public
const searchSales = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  // // Get the limit value from req.query
  // const limit = parseInt(req.query.limit) || 20;

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  const capTitle = searchParams.title
    ? capitalize(searchParams.title)
    : searchParams.title;

  const capType = searchParams.type
    ? capitalize(searchParams.type)
    : searchParams.type;

  //* Create a map of query parameter names to their corresponding Prisma filter conditions
  const filterMap = {
    title: { contains: capTitle },
    type: { contains: capType },
    area: { lte: parseFloat(searchParams.area) },
    totalPrice: { lte: parseFloat(searchParams.totalPrice) },
    rPSqft: { lte: parseFloat(searchParams.rPSqft) },
    bedrooms: { equals: parseInt(searchParams.bedrooms) },
    bathrooms: { equals: parseInt(searchParams.bathrooms) },
  };

  for (const param in searchParams) {
    if (searchParams[param] && filterMap[param]) {
      where[param] = filterMap[param];
    }
  }

  const properties = await prismadb.saleProperty.findMany({
    where: where,
    include: {
      agent: true,
      images: true,
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

  const take = parseInt(req.query.take) || undefined;

  const properties = await prismadb.saleProperty.findMany({
    include: {
      agent: true,
      images: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
    take,
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
    agentId,
  } = req.body;

  let { amenities, views } = req.body;

  const pdfUrl = req.pdfUrl;
  const bluePrint = req.bluePrint;

  const convertedImages = req.convertedImages;

  //* Confirm data

  if (
    !title ||
    !owner ||
    !city ||
    !country ||
    !location ||
    !type ||
    !area ||
    !bedrooms ||
    !bathrooms ||
    !parkingCount ||
    !mapUrl ||
    !amenities ||
    !agentId ||
    !views
  ) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //* converts

  const capTitle = capitalize(title);

  if (!Array.isArray(amenities)) {
    amenities = [amenities];
  }

  if (!Array.isArray(views)) {
    views = [views];
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
      title: capTitle,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Property title already exists!" });
  }

  //* converts

  const capOwner = capitalize(owner);
  const capCity = capitalize(city);
  const capCountry = capitalize(country);

  const areaDecimal = parseFloat(area);
  const rpsDecimal = parseFloat(rPSqft);
  const priceDecimal = parseFloat(totalPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Create new saleProperty

  const property = await prismadb.saleProperty.create({
    data: {
      title: capTitle,
      owner: capOwner,
      city: capCity,
      country: capCountry,
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
      views,
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
  } = req.body;

  let { amenities, views } = req.body;

  let pdfUrl = req.pdfUrl;
  let bluePrint = req.bluePrint;

  const { sId } = req.params;

  if (!sId) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  let convertedImages = req.convertedImages;

  //* Confirm data

  if (!title || !owner || !city || !country) {
    return res.status(400).json({ message: "Title required!" });
  }

  //* converts

  const capTitle = capitalize(title);
  const capOwner = capitalize(owner);
  const capCity = capitalize(city);
  const capCountry = capitalize(country);

  if (amenities && !Array.isArray(amenities)) {
    amenities = [amenities];
  }

  if (views && !Array.isArray(views)) {
    views = [views];
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

  if (capTitle !== property.title && title !== undefined) {
    const newTitle = capTitle.match(/[a-zA-Z]+/g).join(" ");
    const oldTitle = property.title.match(/[a-zA-Z]+/g).join(" ");

    //* Check if new images provided
    if (convertedImages.length === 0) {
      await renameOldFile("sales", oldTitle, newTitle, res);

      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "sales",
        newTitle
      );

      // Check if the folder exists
      if (fs.existsSync(imagesFolder)) {
        try {
          // List all files in the folder
          const files = await fsPromises.readdir(imagesFolder);

          for (const file of files) {
            const outputImageURL = new URL(
              path.join(
                process.env.ROOT_PATH,
                "uploads",
                "images",
                "sales",
                newTitle,
                file
              )
            ).toString();

            convertedImages.push(outputImageURL);
          }

          await prismadb.saleProperty.update({
            where: {
              id: sId,
            },
            data: {
              images: {
                deleteMany: {},
              },
            },
          });

          await prismadb.saleProperty.update({
            where: {
              id: sId,
            },
            data: {
              images: {
                create: convertedImages.map((url) => ({
                  url,
                })),
              },
            },
          });
        } catch (error) {
          console.error("Error reading files from folder:", error);
          return res.status(500).json({ message: "Internal Server Error" });
        }
      }
    } else {
      // Define the path to the images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "sales",
        oldTitle
      );

      await fileDelete(imagesFolder, res);
    }

    //* Check if new pdf provided
    if (!pdfUrl) {
      await renameOldPdf(`${oldTitle}.pdf`, `${newTitle}.pdf`, res);

      const newPdfPath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "factSheets",
          `${newTitle}.pdf`
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
        `${oldTitle}.pdf`
      );

      await fileDelete(pdfFile, res);
    }

    //* Check if new blueprint provided
    if (!bluePrint) {
      await renameOldFile(
        "bluePrints",
        `${oldTitle}.webp`,
        `${newTitle}.webp`,
        res
      );

      const newBluePrint = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "images",
          "bluePrints",
          `${newTitle}.webp`
        )
      ).toString();

      bluePrint = newBluePrint;
    } else {
      // Define the path to the bluePrints folder
      const bluePrintFile = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "bluePrints",
        `${oldTitle}.webp`
      );

      await fileDelete(bluePrintFile, res);
    }
  } else {
    if (convertedImages.length !== 0) {
      await prismadb.saleProperty.update({
        where: {
          id: sId,
        },
        data: {
          images: {
            deleteMany: {},
          },
        },
      });

      await prismadb.saleProperty.update({
        where: {
          id: sId,
        },
        data: {
          images: {
            create: convertedImages.map((url) => ({
              url,
            })),
          },
        },
      });
    }
  }

  //* converts

  const areaDecimal = parseFloat(area);
  const rpsDecimal = parseFloat(rPSqft);
  const priceDecimal = parseFloat(totalPrice);

  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingCountInt = parseInt(parkingCount, 10);

  //* Update saleProperty

  const updatedProperty = await prismadb.saleProperty.update({
    where: {
      id: sId,
    },
    data: {
      title: capTitle,
      owner: capOwner,
      city: capCity,
      country: capCountry,
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
      views,
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
      id: sId,
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

  await fileDelete(imagesFolder, res);

  // Define the path to the property's pdf file
  const pdfFile = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    `${result.title}.pdf`
  );

  await fileDelete(pdfFile);

  // Define the path to the property's bluePrint image
  const bluePrintFile = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "bluePrints",
    `${result.title}.webp`
  );

  await fileDelete(bluePrintFile);

  res.json({
    message: `Property ${result.title} with ID: ${result.id} deleted.`,
  });
};

// @desc Delete saleProperties
// @route DELETE /sales
//! @access Private
const deleteSales = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Property IDs required in an array!" });
  }

  for (const sId of ids) {
    //? Does the property exist to delete?
    const property = await prismadb.saleProperty.findUnique({
      where: {
        id: sId,
      },
    });

    if (!property) {
      return res
        .status(404)
        .json({ message: `Property with ID ${sId} not found!` });
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

    await fileDelete(imagesFolder);

    // Define the path to the property's pdf file
    const pdfFile = path.join(
      __dirname,
      "..",
      "uploads",
      "factSheets",
      `${result.title}.pdf`
    );

    await fileDelete(pdfFile);

    // Define the path to the property's bluePrint image
    const bluePrintFile = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "bluePrints",
      `${result.title}.webp`
    );

    await fileDelete(bluePrintFile);
  }

  res.json({
    message: "Properties deleted successfully.",
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
  deleteSales,
};
