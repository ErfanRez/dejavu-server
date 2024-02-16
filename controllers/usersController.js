const prismadb = require("../lib/prismadb");
const bcrypt = require("bcrypt");

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

// @desc Sign up new user
// @route POST /users
//! @access Public
const signUp = async (req, res) => {
  const { username, email, password, phone } = req.body;

  //* Confirm data

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields required!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const duplicate = await prismadb.user.findUnique({
    where: {
      email,
    },
  });

  if (duplicate)
    return res.status(409).json({ message: "User email already exists!" });

  //* Create new user
  const user = await prismadb.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
      phone,
    },
  });

  if (user) {
    //*created

    const { password: hashedPWd, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  } else {
    res.status(400).json({ message: "Invalid user data received!" });
  }
};

// @desc Sign up new user via google
// @route POST /users/google
//! @access Public
const googleAuth = async (req, res) => {
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
    return res.status(409).json({ message: "User email already exists!" });
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

      res.status(201).json({ message: "User created successfully." });
    } else {
      res.status(400).json({ message: "Invalid user data received!" });
    }
  }
};

// @desc Sign in user
// @route POST /users
//! @access Public
const signIn = async (req, res) => {
  const { email, password } = req.body;

  //* Confirm data

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required!" });
  }

  //? Does the user exist?
  const user = await prismadb.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  const validPassword = await bcrypt.compare(password, user.password);

  if (!validPassword)
    return res.status(401).json({ message: "Wrong credentials!" });

  const { password: hashedPWd, ...userWithoutPassword } = user;

  return res.status(200).json(userWithoutPassword);
};

// @desc Delete multiple users
// @route DELETE /users
//! @access Private
const deleteUsers = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids) {
    return res.status(400).json({ message: "Users IDs required!" });
  }

  //? Does the users exist to delete?
  const users = await prismadb.user.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!users) {
    return res.status(404).json({ message: "Users not found!" });
  }

  await prismadb.user.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  res.json({
    message: "Users deleted.",
  });
};

module.exports = {
  getUserById,
  getAllUsers,
  signUp,
  googleAuth,
  signIn,
  deleteUsers,
};
