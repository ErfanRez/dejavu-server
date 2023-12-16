const prismadb = require("../lib/prismadb");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcrypt");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");

function exclude(admins) {
  const adminsWithoutPassword = admins?.map((admin) => {
    // Exclude admin with specific ID
    if (admin.id === process.env.SUPER_ID) {
      return null;
    }

    const { password, ...adminWithoutPassword } = admin;
    return adminWithoutPassword;
  });

  // Filter out null values (admins with specific ID)
  const filteredAdmins = adminsWithoutPassword?.filter(
    (admin) => admin !== null
  );

  return filteredAdmins;
}

const excludePassword = (admin) => {
  // Exclude admin with specific ID
  if (admin.id === process.env.SUPER_ID) {
    return null;
  }

  // Destructure the admin object and exclude the 'password' property
  const { password, ...adminWithoutPassword } = admin;
  return adminWithoutPassword;
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

  const adminsWithoutPassword = exclude(admins);

  res.json(adminsWithoutPassword);
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

  const adminWithoutPassword = excludePassword(admin);

  res.json(adminWithoutPassword);
};

// @desc Create new admin
// @route POST /admin
//! @access Private
const createNewAdmin = async (req, res) => {
  const { username, password, email } = req.body;

  // console.log(req.files);
  const convertedImage = req.convertedImage;

  //* Confirm data

  if (!username || !password || !email) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.user.findFirst({
    where: {
      email,
      username,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Admin already exists!" });
  }

  // Hash password
  const hashedPwd = await bcrypt.hash(password, 10);

  //* Create new admin

  const admin = await prismadb.admin.create({
    data: {
      username,
      password: hashedPwd,
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
  const { username, password, email } = req.body;
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

  let hashedPwd = undefined;

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
    if (!convertedImage && admin.imageUrl !== null) {
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
  } else {
    const imagesFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "admins",
      `${admin.username}.webp`
    );

    if (fs.existsSync(imagesFolder)) {
      const newImagePath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "images",
          "admins",
          `${admin.username}.webp`
        )
      ).toString();

      convertedImage = newImagePath;
    }
  }

  if (password) {
    // Hash password
    hashedPwd = await bcrypt.hash(password, 10); // salt rounds
  }

  //* Update admin

  const updatedAdmin = await prismadb.admin.update({
    where: {
      id: id,
    },
    data: {
      username,
      password: hashedPwd,
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

  // Check if the admin has a role of "superAdmin"
  if (admin.role === "superAdmin") {
    return res.status(403).json({ message: "Cannot delete super admin!" });
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
  getAdminById,
  getAllAdmins,
  createNewAdmin,
  updateAdmin,
  deleteAdmin,
};
