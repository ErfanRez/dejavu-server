const prismadb = require("../lib/prismadb");

// @desc Get all Properties
// @route GET /Properties
//! @access Public
const getAllProperties = async (req, res) => {
  //* Get all properties from DB

  const properties = await prismadb.property.findMany({
    include: {
      images: true,
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
    category,
    size,
    location,
    bedrooms,
    parkings,
    bathrooms,
    price,
    description,
  } = req.body;

  // console.log(req.files);

  const imageUrls = [];

  const imageUrl = req.files.map((file) => {
    imageUrls.push(file.filename);
  });

  //* Confirm data

  if (
    !title ||
    !category ||
    !size ||
    !location ||
    !bedrooms ||
    !bathrooms ||
    !parkings ||
    !price ||
    !imageUrl
  ) {
    res
      .status(400)
      .json({ message: "All fields except description are required" });
  }

  //? Check for duplicate

  //* convert to int

  const sizeInt = parseInt(size, 10);
  const bedroomsInt = parseInt(bedrooms, 10);
  const bathroomsInt = parseInt(bathrooms, 10);
  const parkingsInt = parseInt(parkings, 10);

  //* Create new property

  const property = await prismadb.property.create({
    data: {
      title,
      category,
      size: sizeInt,
      location,
      bedrooms: bedroomsInt,
      parkings: parkingsInt,
      bathrooms: bathroomsInt,
      price,
      description,
      images: {
        createMany: {
          data: imageUrls.map((imageUrl) => ({
            url: imageUrl,
          })),
        },
      },
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
    category,
    size,
    location,
    bedrooms,
    bathrooms,
    parkings,
    price,
    description,
  } = req.body;

  const imageUrls = [];

  const imageUrl = req.files.map((file) => {
    imageUrls.push(file.filename);
  });

  const { propertyId } = req.query;

  //* Confirm data

  if (
    !title ||
    !category ||
    !size ||
    !location ||
    !bedrooms ||
    !bathrooms ||
    !parkings ||
    !price ||
    !imageUrl
  ) {
    return res
      .status(400)
      .json({ message: "All fields except description are required" });
  }

  //* convert to int

  const sizeInt = parseInt(size, 10);
  const bedroomsInt = parseInt(bedrooms, 10);
  const parkingsInt = parseInt(parkings, 10);

  //? Does the property exist to update?

  const property = await prismadb.property.findUnique({
    where: {
      id: propertyId,
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
      category,
      size: sizeInt,
      location,
      bedrooms: bedroomsInt,
      bathrooms: bathroomsInt,
      parkings: parkingsInt,
      price,
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
