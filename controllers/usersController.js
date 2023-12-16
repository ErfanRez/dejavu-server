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

  const duplicate = await prismadb.user.findUnique({
    where: {
      email,
    },
  });

  if (duplicate) {
    return res.status(200).json(duplicate);
  } else {
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

      res.status(201).json(user);
    } else {
      res.status(400).json({ message: "Invalid user data received!" });
    }
  }
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
  deleteUser,
};
