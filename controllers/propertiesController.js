const prismadb = require("../lib/prismadb");

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
  const { title, size, location, bedrooms, price, imageUrl, description } =
    req.body;

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
const updateProperty = async (req, res) => {
  const { title, size, location, bedrooms, price, imageUrl, description } =
    req.body;

  const { propertyId } = req.params;

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

  res.json({ message: `${updatedUser.username} updated` });
};

// @desc Delete a user
// @route DELETE /users
// @access Private
const deleteUser = async (req, res) => {
  const { id } = req.body;

  // Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required" });
  }

  // Does the user still have assigned notes?
  const note = await Note.findOne({ user: id }).lean().exec();
  if (note) {
    return res.status(400).json({ message: "User has assigned notes" });
  }

  // Does the user exist to delete?
  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const result = await user.deleteOne();

  const reply = `Username ${result.username} with ID ${result._id} deleted`;

  res.json(reply);
};

module.exports = {
  getAllProperties,
  createNewProperty,
  updateProperty,
  deleteUser,
};
