const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");

// @desc Get searched admins
// @route GET /admins/search
//! @access Private
const searchAdmins = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  for (const param in searchParams) {
    if (searchParams[param]) {
      where[param] = {
        contains: searchParams[param],
      };
    }
  }

  const admins = await prismadb.admin.findMany({
    where: where,
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!admins?.length) {
    return res.status(404).json({ message: "No admins found!" });
  }

  res.json(admins);
};

// @desc Get all admins
// @route GET /admins
//! @access Private
const getAllAdmins = async (req, res) => {
  //* Get all admins from DB

  const admins = await prismadb.admin.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no admins

  if (!admins?.length) {
    return res.status(404).json({ message: "No admins found!" });
  }

  res.json(admins);
};

// @desc Get an unique admin
// @route GET /admins/:id
//! @access Private
const getAdminById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Admin ID Required!" });
  }

  //? Does the admin exist?
  const admin = await prismadb.admin.findUnique({
    where: {
      id,
    },
  });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found!" });
  }

  res.json(admin);
};

// @desc Create new admin
// @route POST /admin
//! @access Private
const createNewAdmin = async (req, res) => {
  const { username, email } = req.body;

  // console.log(req.files);
  const convertedImage = req.convertedImage;

  //* Confirm data

  if (!username || !email) {
    return res.status(400).json({ message: "username and email required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.admin.findUnique({
    where: {
      username,
      email,
    },
  });

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "username or email already exists!" });
  }

  //* Create new admin

  const admin = await prismadb.admin.create({
    data: {
      username,
      email,
      imageUrl: convertedImage,
    },
  });

  if (admin) {
    //*created

    res.status(201).json({ message: `New admin ${username} created.` });
  } else {
    res.status(400).json({ message: "Invalid admin data received!" });
  }
};

// @desc Update a admin
// @route PATCH /admins/:id
//! @access Private
const updateAdmin = async (req, res) => {
  const { username, email } = req.body;
  const { id } = req.params;

  // console.log(req.files);
  let convertedImage = req.convertedImage;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Admin ID required!" });
  }

  if (!username || !email) {
    return res.status(400).json({ message: "username and email required!" });
  }

  //? Does the admin exist to update?
  const admin = await prismadb.admin.findUnique({
    where: {
      id,
    },
  });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found!" });
  }

  if (username !== admin.username && username !== undefined) {
    //* Check if new image provided
    if (!convertedImage) {
      await renameOldFile(
        "admins",
        `${admin.username}.webp`,
        `${username}.webp`
      );

      const newImagePath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "images",
          "admins",
          `${username}.webp`
        )
      ).toString();

      convertedImage = newImagePath;
    } else {
      // Define the path to the admin's images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "admins",
        `${admin.username}.webp`
      );

      await fileDelete(imagesFolder);
    }
  }

  //* Update admin

  const updatedAdmin = await prismadb.admin.update({
    where: {
      id: id,
    },
    data: {
      username,
      email,
      imageUrl: convertedImage,
    },
  });

  res.json({ message: `admin ${updatedAdmin.username} updated.` });
};

// @desc Delete a admin
// @route DELETE /admins/:id
//! @access Private
const deleteAdmin = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Admin ID required!" });
  }

  //? Does the admin exist to delete?
  const admin = await prismadb.admin.findUnique({
    where: {
      id: id,
    },
  });

  if (!admin) {
    return res.status(404).json({ message: "Admin not found!" });
  }

  const result = await prismadb.admin.delete({
    where: {
      id: id,
    },
  });

  // Define the path to the admin's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "admins",
    `${admin.username}.webp`
  );

  await fileDelete(imagesFolder);

  res.json({
    message: `Admin ${result.username} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchAdmins,
  getAdminById,
  getAllAdmins,
  createNewAdmin,
  updateAdmin,
  deleteAdmin,
};
