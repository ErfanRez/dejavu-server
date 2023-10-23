const prismadb = require("../lib/prismadb");

// @desc Get searched favRents related to a specific user
// @route GET /:uId/fav-rents/search
//! @access Private
const searchUnitsByUID = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params
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
  });

  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const units = await prismadb.favrent.findMany({
    where: {
      userId: uId,
    },
    include: {
      saleUnit: {
        where: {
          title: {
            contains: searchString,
          },
        },
      },
    },
  });

  //* If no units

  if (!units?.length) {
    return res
      .status(400)
      .json({ message: `No favorite units found for ${user.username}!` });
  }

  res.json(units);
};

// @desc Get all favRents related to a specific user
// @route GET /:uId/fav-rents
//! @access Public
const getAllUnitsByUID = async (req, res) => {
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
  });

  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  //* Get all favRents from DB

  const units = await prismadb.favrent.findMany({
    where: {
      userId: uId,
    },
    include: {
      saleUnit: true,
    },
  });

  //* If no units

  if (!units?.length) {
    return res
      .status(400)
      .json({ message: `No favorite units found for ${user.username}!` });
  }

  res.json(units);
};

// @desc Create new favRent
// @route POST /:uId/fav-rents
//! @access Private
const createNewFavRent = async (req, res) => {
  const { rentId } = req.body;

  const { uId } = req.params;

  //* Confirm data

  if (!uId || !rentId) {
    return res.status(400).json({ message: "User and sale unit ID Required!" });
  }

  //? Does the user exist?
  const user = await prismadb.user.findUnique({
    where: {
      id: uId,
    },
  });

  if (!user) {
    return res.status(400).json({ message: "User not found!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.favsale.findUnique({
    where: {
      userId_rentId: {
        userId: uId,
        rentId: rentId,
      },
    },
  });

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Unit already added to favorites!" });
  }

  //* Create new favRent

  const unit = await prismadb.favrent.create({
    data: {
      userId: uId,
      saleUnit: {
        connect: {
          id: rentId,
        },
      },
    },
  });

  if (unit) {
    //*created

    res.status(201).json({
      message: `Unit added to user ${user.username} favorites.`,
    });
  } else {
    res.status(400).json({ message: "Invalid unit data received!" });
  }
};

// @desc Delete a favRent
// @route DELETE /:uId/fav-rents/
//! @access Private
const deleteFavRent = async (req, res) => {
  const { rentId } = req.body;

  const { uId } = req.params;

  //* Confirm data

  if (!uId || !rentId) {
    return res.status(400).json({ message: "User and sale unit ID Required!" });
  }

  //? Does the user exist?
  const user = await prismadb.user.findUnique({
    where: {
      id: uId,
    },
  });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  //* Create new favRent

  const deletedFavRent = await prismadb.favrent.delete({
    where: {
      userId_rentId: {
        userId: uId,
        rentId: rentId,
      },
    },
  });

  if (!deletedFavRent) {
    return res
      .status(404)
      .json({ message: "Favorite sale unit not found for the user!" });
  }

  res.json({
    message: `Unit removed from user's favorites.`,
  });
};

module.exports = {
  searchUnitsByUID,
  getAllUnitsByUID,
  createNewFavRent,
  deleteFavRent,
};
