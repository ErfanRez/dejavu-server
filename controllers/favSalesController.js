const prismadb = require("../lib/prismadb");

// @desc Get searched favSales related to a specific user
// @route GET /:uId/fav-sales/search
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

  const units = await prismadb.favSale.findMany({
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
        include: {
          images: true,
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

// @desc Create new favSale
// @route POST /:uId/fav-sales
//! @access Private
const createNewFavSale = async (req, res) => {
  const { saleId } = req.body;

  const { uId } = req.params;

  //* Confirm data

  if (!uId || !saleId) {
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

  const duplicate = await prismadb.favSale.findFirst({
    where: {
      userId: uId,
      saleId: saleId,
    },
  });

  if (duplicate) {
    return res
      .status(409)
      .json({ message: "Unit already added to favorites!" });
  }

  //* Create new favSale

  const unit = await prismadb.favSale.create({
    data: {
      user: {
        connect: {
          id: uId,
        },
      },
      saleUnit: {
        connect: {
          id: saleId,
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

// @desc Delete a favSale
// @route DELETE /:uId/fav-sales/
//! @access Private
const deleteFavSale = async (req, res) => {
  const { saleId } = req.body;
  const { uId } = req.params;

  //* Confirm data

  if (!uId || !saleId) {
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

  //* delete favSale

  const favField = await prismadb.favSale.findFirst({
    where: {
      userId: uId,
      saleId: saleId,
    },
  });

  if (!favField) {
    return res
      .status(404)
      .json({ message: "Favorite sale unit not found for the user!" });
  }

  const deletedFav = await prismadb.favSale.delete({
    where: {
      id: favField.id,
    },
  });

  res.json({
    message: `Unit ${deletedFav.id} removed from user's favorites.`,
  });
};

module.exports = {
  searchUnitsByUID,
  createNewFavSale,
  deleteFavSale,
};
