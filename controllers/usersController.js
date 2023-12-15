const prismadb = require("../lib/prismadb");

// @desc Get all users
// @route GET /users
//! @access Private
const getAllUsers = async (req, res) => {
  //* Get all users from DB

  const users = await prismadb.user.findMany({
    include: {
      favSales: true,
      favRents: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no users

  if (!users?.length) {
    return res.status(404).json({ message: "No users found!" });
  }

  res.json(users);
};

// @desc Get an unique user
// @route GET /users/:id
//! @access Private
const getUserById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID Required!" });
  }

  //? Does the user exist?
  const user = await prismadb.user.findUnique({
    where: {
      id,
    },
    include: {
      favSales: true,
      favRents: true,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  res.json(user);
};

// @desc Create new user
// @route POST /user
//! @access Private
const createNewUser = async (req, res) => {
  const { username, email, imageUrl } = req.body;

  //* Confirm data

  if (!username || !email) {
    return res.status(400).json({ message: "Username and email required!" });
  }

  //? Check for duplicate

  const duplicateUsername = await prismadb.user.findUnique({
    where: {
      username,
    },
  });

  const duplicateEmail = await prismadb.user.findUnique({
    where: {
      email,
    },
  });

  const duplicate = duplicateUsername || duplicateEmail;

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Username or email already exists!" });
  }

  //* Create new user

  const user = await prismadb.user.create({
    data: {
      username,
      email,
      imageUrl,
    },
  });

  if (user) {
    //*created

    res.status(201).json({ message: `New user ${username} created.` });
  } else {
    res.status(400).json({ message: "Invalid user data received!" });
  }
};

// @desc Update a user
// @route PATCH /users/:id
//! @access Private
const updateUser = async (req, res) => {
  const { username, email, imageUrl } = req.body;
  const { id } = req.params;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "User ID required!" });
  }

  if (!username || !email) {
    return res.status(400).json({ message: "Username and email required!" });
  }

  //? Does the user exist to update?
  const user = await prismadb.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  //* Update user

  const updatedUser = await prismadb.user.update({
    where: {
      id: id,
    },
    data: {
      username,
      email,
      imageUrl,
    },
  });

  res.json({ message: `user ${updatedUser.username} updated.` });
};

// @desc Delete a user
// @route DELETE /users/:id
//! @access Private
const deleteUser = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "User ID required!" });
  }

  //? Does the user exist to delete?
  const user = await prismadb.user.findUnique({
    where: {
      id,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  const result = await prismadb.user.delete({
    where: {
      id: id,
    },
  });

  res.json({
    message: `User ${result.username} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  getUserById,
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
