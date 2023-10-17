const prismadb = require("../lib/prismadb");
const path = require("path");

// @desc Get all Properties
// @route GET /Properties
//! @access Public
const getAllProperties = async (req, res) => {
  //* Get all properties from DB

  const properties = await prismadb.property.findMany({
    include: {
      images: true,
      views: true,
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
      .json({ message: "All fields except description are required" });
  }

  //* Getting related images' paths

  const imageUrls = [];

  convertedImages.map((image) => {
    imageUrls.push(image);
  });

  //? Check for duplicate

  //* convert to int

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

    res.status(201).json({ message: `New property ${title} created` });
  } else {
    res.status(400).json({ message: "Invalid property data received" });
  }
};

// @desc Update a property
// @route PATCH /property
//! @access Public
const updateProperty = async (req, res) => {
  const {
    title,
    type,
    category,
    area,
    location,
    bedroomCount,
    bathroomCount,
    parkingCount,
    price,
    rate,
    description,
  } = req.body;

  const { propertyId } = req.query;
  const convertedImages = req.convertedImages;

  //* Confirm data

  if (
    !title ||
    !type ||
    !category ||
    !area ||
    !location ||
    !bedroomCount ||
    !bathroomCount ||
    !parkingCount ||
    !price ||
    !rate ||
    !convertedImages
  ) {
    return res
      .status(400)
      .json({ message: "All fields except description are required" });
  }

  //* Getting related images' paths

  const imageUrls = [];

  convertedImages.map((image) => {
    const imagePath = path.join(
      __dirname,
      "..",
      "images",
      `${req.body.title}`,
      image
    );
    imageUrls.push(imagePath);
  });

  //* convert to int

  const areaInt = parseInt(area, 10);
  const bedroomCountInt = parseInt(bedroomCount, 10);
  const bathroomCountInt = parseInt(bedroomCount, 10);
  const parkingCountInt = parseInt(parkingCount, 10);
  const rateDecimal = parseFloat(rate);

  //? Does the property exist to update?

  const property = await prismadb.property.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      type: true,
      images: true,
    },
  });

  if (!property) {
    res.status(400).json({ message: "Property not found!" });
  }

  //* Update property

  const updatedProperty = await prismadb.property.update({
    where: {
      id: propertyId,
    },
    data: {
      title,
      type,
      area: areaInt,
      location,
      bedroomCount: bedroomCountInt,
      bathroomCount: bathroomCountInt,
      parkingCount: parkingCountInt,
      price,
      rate: rateDecimal,
      description,
      images: {
        updateMany: imageUrls.map((imageUrl) => ({
          where: {
            propertyId,
          },
          data: {
            url: imageUrl,
          },
        })),
      },
    },
    include: {
      images: true,
    },
  });

  res.json({ message: `${updatedProperty.title} Property updated` });
};

// @desc Delete a property
// @route DELETE /properties
//! @access Public
const deleteProperty = async (req, res) => {
  const { propertyId } = req.query;

  //* Confirm data
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  // ? Does the property still have assigned relations?

  //* Does the user exist to delete?
  const property = await prismadb.property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    return res.status(400).json({ message: "Property not found" });
  }

  const result = await prismadb.property.delete({
    where: {
      id: propertyId,
    },
  });

  res.json({
    message: `Property ${result.title} with ID ${result.id} deleted!`,
  });
};

module.exports = {
  getAllProperties,
  createNewProperty,
  updateProperty,
  deleteProperty,
};
