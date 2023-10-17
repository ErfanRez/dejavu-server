const prismadb = require("../lib/prismadb");
const path = require("path");
const fs = require("fs");

// @desc Get an unique property
// @route GET /properties/:id
//! @access Public
const getPropertyById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  //* Does the property exist to delete?
  const property = await prismadb.property.findUnique({
    where: {
      id,
    },
    include: {
      images: true,
      views: true,
    },
  });

  if (!property) {
    return res.status(400).json({ message: "Property not found!" });
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
      views: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no properties

  if (!properties?.length) {
    return res.status(400).json({ message: "No properties found" });
  }

  res.json(properties);
};

// @desc Create new property
// @route POST /property
//! @access Public
const createNewProperty = async (req, res) => {
  const {
    title,
    categoryTitle,
    typeTitle,
    views,
    area,
    location,
    floor,
    bedroomCount,
    parkingCount,
    bathroomCount,
    price,
    rate,
    description,
  } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;

  //* Confirm data

  if (
    !title ||
    !categoryTitle ||
    !typeTitle ||
    !views ||
    !area ||
    !location ||
    !floor ||
    !bedroomCount ||
    !bathroomCount ||
    !parkingCount ||
    !price ||
    !rate ||
    !convertedImages
  ) {
    res
      .status(400)
      .json({ message: "All fields except description required!" });
  }

  //* Getting related images' paths

  const imageUrls = [];

  convertedImages.map((image) => {
    imageUrls.push(image);
  });

  //? Check for duplicate

  //* converts

  const floorInt = parseInt(floor, 10);
  const areaInt = parseInt(area, 10);
  const bedroomCountInt = parseInt(bedroomCount, 10);
  const bathroomCountInt = parseInt(bathroomCount, 10);
  const parkingCountInt = parseInt(parkingCount, 10);
  const rateDecimal = parseFloat(rate);

  //* Create new property

  const property = await prismadb.property.create({
    data: {
      title,
      category: categoryTitle,
      type: typeTitle,
      area: areaInt,
      location,
      floor: floorInt,
      bedroomCount: bedroomCountInt,
      parkingCount: parkingCountInt,
      bathroomCount: bathroomCountInt,
      price,
      rate: rateDecimal,
      description,
      views: {
        create: views.map((viewTitle) => ({
          title: viewTitle,
        })),
      },
      images: {
        create: imageUrls.map((url) => ({
          url,
        })),
      },
    },
    include: {
      images: true,
      views: true,
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
// @route PATCH /properties/:id
//! @access Public
const updateProperty = async (req, res) => {
  const {
    title,
    categoryTitle,
    typeTitle,
    views,
    area,
    location,
    floor,
    bedroomCount,
    parkingCount,
    bathroomCount,
    price,
    rate,
    description,
    status,
  } = req.body;

  const { id } = req.params;

  const convertedImages = req.convertedImages;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  if (
    !title ||
    !categoryTitle ||
    !typeTitle ||
    !views ||
    !area ||
    !location ||
    !floor ||
    !bedroomCount ||
    !bathroomCount ||
    !parkingCount ||
    !price ||
    !rate ||
    !status ||
    !convertedImages
  ) {
    return res
      .status(400)
      .json({ message: "All fields except description required!" });
  }

  //* Getting related images' paths

  const imageUrls = [];

  convertedImages.map((image) => {
    imageUrls.push(image);
  });

  //* converts

  const statusBoolean = JSON.parse(status);

  const floorInt = parseInt(floor, 10);
  const areaInt = parseInt(area, 10);
  const bedroomCountInt = parseInt(bedroomCount, 10);
  const bathroomCountInt = parseInt(bedroomCount, 10);
  const parkingCountInt = parseInt(parkingCount, 10);
  const rateDecimal = parseFloat(rate);

  //? Does the property exist to update?

  const property = await prismadb.property.findUnique({
    where: {
      id,
    },
  });

  if (!property) {
    res.status(400).json({ message: "Property not found!" });
  }

  //* Update property

  await prismadb.property.update({
    where: {
      id,
    },
    data: {
      title,
      category: categoryTitle,
      type: typeTitle,
      area: areaInt,
      location,
      floor: floorInt,
      bedroomCount: bedroomCountInt,
      bathroomCount: bathroomCountInt,
      parkingCount: parkingCountInt,
      price,
      rate: rateDecimal,
      description,
      status: statusBoolean,
      views: {
        deleteMany: {},
      },
      images: {
        deleteMany: {},
      },
    },
  });

  //! update snippet alternative for images
  // images: {
  //         updateMany: imageUrls.map((imageUrl) => ({
  //           where: {
  //             propertyId,
  //           },
  //           data: {
  //             url: imageUrl,
  //           },
  //         })),
  //       },

  const updatedProperty = await prismadb.property.update({
    where: {
      id,
    },
    data: {
      views: {
        create: views.map((viewTitle) => ({
          title: viewTitle,
        })),
      },
      images: {
        create: imageUrls.map((url) => ({
          url,
        })),
      },
    },
  });

  res.json({ message: `property ${updatedProperty.title} updated.` });
};

// @desc Delete a property
// @route DELETE /properties/:id
//! @access Public
const deleteProperty = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Property ID required!" });
  }

  //* Does the property exist to delete?
  const property = await prismadb.property.findUnique({
    where: {
      id,
    },
  });

  if (!property) {
    return res.status(400).json({ message: "Property not found!" });
  }

  const result = await prismadb.property.delete({
    where: {
      id,
    },
  });
  // Define the path to the property's images folder
  const imagesFolder = path.join(__dirname, "..", "images", result.title);

  // Check if the folder exists
  if (fs.existsSync(imagesFolder)) {
    // Delete the folder and its contents
    fs.rmSync(imagesFolder, { recursive: true, force: true });
  }

  res.json({
    message: `Property ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  getPropertyById,
  getAllProperties,
  createNewProperty,
  updateProperty,
  deleteProperty,
};
