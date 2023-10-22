const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");

// @desc Get searched users
// @route GET /users/search
//! @access Private
const searchUsersByUsername = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const users = await prismadb.user.findMany({
    where: {
      username: {
        contains: searchString,
      },
    },
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
// @route GET /users/:uId
//! @access Private
const getUserById = async (req, res) => {
  const { uId } = req.params;

  //* Confirm data
  if (!uId) {
    return res.status(400).json({ message: "User ID Required!" });
  }

  //? Does the user exist?
  const user = await prismadb.user.findUnique({
    where: {
      id: uId,
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
  const { username, email, isAdmin } = req.body;

  // console.log(req.files);
  const convertedImage = req.convertedImage;

  //* Confirm data

  if (!username || !email) {
    res.status(400).json({ message: "Username and email required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.user.findUnique({
    where: {
      username,
      email,
    },
  });

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Username or email already exists!" });
  }

  //* converts

  isAdmin
    ? (isAdminBoolean = JSON.parse(isAdmin))
    : (isAdminBoolean = undefined);

  //* Create new user

  const user = await prismadb.user.create({
    data: {
      username,
      email,
      isAdmin: isAdminBoolean,
      imageUrl: convertedImage,
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
// @route PATCH /users/:uId
//! @access Private
const updateUser = async (req, res) => {
  const { username, email, isAdmin } = req.body;
  const { uId } = req.params;

  // console.log(req.files);
  let convertedImage = req.convertedImage;

  //* Confirm data

  if (!uId) {
    return res.status(400).json({ message: "User ID required!" });
  }

  if (!username || !email) {
    res.status(400).json({ message: "Username and email required!" });
  }

  //? Does the user exist to update?
  const user = await prismadb.user.findUnique({
    where: {
      id: uId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  if (username !== user.username) {
    //* Check if new image provided
    if (!convertedImage) {
      renameOldFile("users", `${user.username}.webp`, `${username}.webp`);

      const newImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "users",
        `${username}.webp`
      );

      convertedImage = newImagePath;
    } else {
      // Define the path to the user's images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "users",
        `${user.username}.webp`
      );

      fileDelete(imagesFolder);
    }
  }

  //* converts

  isAdmin
    ? (isAdminBoolean = JSON.parse(isAdmin))
    : (isAdminBoolean = undefined);

  //* Update user

  const updatedUser = await prismadb.user.update({
    where: {
      id: uId,
    },
    data: {
      username,
      email,
      isAdmin: isAdminBoolean,
      imageUrl: convertedImage,
    },
  });

  res.json({ message: `user ${updatedUser.username} updated.` });
};

// @desc Delete a user
// @route DELETE /users/:uId
//! @access Private
const deleteUser = async (req, res) => {
  const { uId } = req.params;

  //* Confirm data
  if (!uId) {
    return res.status(400).json({ message: "User ID required!" });
  }

  //? Does the user exist to delete?
  const user = await prismadb.user.findUnique({
    where: {
      id: uId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  const result = await prismadb.user.delete({
    where: {
      id: uId,
    },
  });

  // Define the path to the user's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "users",
    `${user.username}.webp`
  );

  fileDelete(imagesFolder);

  res.json({
    message: `User ${result.username} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchUsersByUsername,
  getUserById,
  getAllUsers,
  createNewUser,
  updateUser,
  deleteUser,
};
