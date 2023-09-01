const prismadb = require("../lib/prismadb");
const multer = require("multer");

// @desc Get all Properties
// @route GET /Properties
//! @access Public
const getAllProperties = async (req, res) => {
  //* Get all properties from MySQL DB

  const properties = await prismadb.Property.findMany();

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
  const { title, size, location, bedrooms, price, description } = req.body;
  const imageUrl = req.file.filename;
  //* Confirm data

  if (!title || !size || !location || !bedrooms || !price || !imageUrl) {
    res.status(400).json({ message: "All fields are required!" });
  }

  //? Check for duplicate

  //* Create new property

  const property = await prismadb.Property.create({
    data: {
      title,
      size,
      location,
      bedrooms,
      price,
      imageUrl,
      description,
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
const updatedProperty = async (req, res) => {
  const { title, size, location, bedrooms, price, imageUrl, description } =
    req.body;

  const { propertyId } = req.query;

  //* Confirm data

  if (!title || !size || !location || !bedrooms || !price || !imageUrl) {
    return res
      .status(400)
      .json({ message: "All fields except description are required" });
  }

  //* Does the property exist to update?

  const updatedProperty = await prismadb.Property.upsert({
    where: {
      id: propertyId,
    },
    update: {
      title,
      size,
      location,
      bedrooms,
      price,
      imageUrl,
      description,
    },
    create: {
      title,
      size,
      location,
      bedrooms,
      price,
      imageUrl,
      description,
    },
  });

  res.json({ message: `${updatedProperty.title} Property updated` });
};

// @desc Delete a property
// @route DELETE /properties
// @access Private
const deleteProperty = async (req, res) => {
  const { propertyId } = req.query;

  // Confirm data
  if (!propertyId) {
    return res.status(400).json({ message: "Property ID Required!" });
  }

  // ? Does the property still have assigned relations?

  // Does the user exist to delete?
  const property = await prismadb.Property.findUnique({
    where: {
      id: propertyId,
    },
  });

  if (!property) {
    return res.status(400).json({ message: "Property not found" });
  }

  const result = await prismadb.Property.delete({
    where: {
      id: propertyId,
    },
  });

  const reply = `Username ${result.title} with ID ${result.id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllProperties,
  createNewProperty,
  updatedProperty,
  deleteProperty,
};
