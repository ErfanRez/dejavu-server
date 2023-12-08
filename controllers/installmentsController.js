const prismadb = require("../lib/prismadb");

// @desc Get searched installments
// @route GET /installments/search
//! @access Private
const searchInstallments = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const installments = await prismadb.installment.findMany({
    where: {
      title: {
        contains: searchString,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no installments

  if (!installments?.length) {
    return res.status(404).json({ message: "No installments found!" });
  }

  res.json(installments);
};

// @desc Get searched installments related to a specific project
// @route GET /:pId/installments/search
//! @access Public
const searchInstallmentsByPID = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params
  const { pId } = req.params;

  //* Confirm data
  if (!pId) {
    return res.status(400).json({ message: "Project ID Required!" });
  }

  //? Does the project exist?
  const project = await prismadb.project.findUnique({
    where: {
      id: pId,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const installments = await prismadb.installment.findMany({
    where: {
      projectId: pId,
      title: {
        contains: searchString,
      },
    },
  });

  //* If no installments

  if (!installments?.length) {
    return res
      .status(400)
      .json({ message: `No installments related to ${project.title} found!` });
  }

  res.json(installments);
};

// @desc Get all installments
// @route GET /installments
//! @access Private
const getAllInstallments = async (req, res) => {
  //* Get all installments from DB

  const installments = await prismadb.installment.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no installments

  if (!installments?.length) {
    return res.status(404).json({ message: "No installments found!" });
  }

  res.json(installments);
};

// @desc Get all installments related to a specific project
// @route GET /:pId/installments
//! @access Public
const getAllInstallmentsByPID = async (req, res) => {
  const { pId } = req.params;

  //* Confirm data
  if (!pId) {
    return res.status(400).json({ message: "Project ID Required!" });
  }

  //? Does the project exist?
  const project = await prismadb.project.findUnique({
    where: {
      id: pId,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  //* Get all installments from DB

  const installments = await prismadb.installment.findMany({
    where: {
      projectId: pId,
    },
  });

  //* If no installments

  if (!installments?.length) {
    return res
      .status(404)
      .json({ message: `No installments related to ${project.title} found!` });
  }

  res.json(installments);
};

// @desc Get an unique installment
// @route GET /installments/:inId
//! @access Private
const getInstallmentById = async (req, res) => {
  const { inId } = req.params;

  //* Confirm data
  if (!inId) {
    return res.status(400).json({ message: "Installment ID Required!" });
  }

  //? Does the installment exist?
  const installment = await prismadb.installment.findUnique({
    where: {
      id: inId,
    },
  });

  if (!installment) {
    return res.status(404).json({ message: "Installment not found!" });
  }

  res.json(installment);
};

// @desc Create new installment
// @route POST /:pId/installments
//! @access Private
const createNewInstallments = async (req, res) => {
  const { installments } = req.body;
  const { pId } = req.params;

  if (!pId) {
    return res.status(400).json({ message: "Project ID Required!" });
  }

  // Does the project exist?
  const project = await prismadb.project.findUnique({
    where: {
      id: pId,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  // Confirm data
  if (!installments) {
    return res.status(400).json({ message: "Installments required!" });
  }

  // Create new installments
  const createdInstallments = [];

  for (const installment of installments) {
    const { title, percentage } = installment;

    //* converts
    const percentageDecimal = parseFloat(percentage);

    const newInstallment = await prismadb.installment.create({
      data: {
        title,
        percentage: percentageDecimal,
        project: {
          connect: {
            id: pId,
          },
        },
      },
    });

    if (newInstallment) {
      createdInstallments.push(newInstallment);
    }
  }

  if (createdInstallments.length > 0) {
    return res.status(201).json({
      message: `New installments created for project ${project.title}.`,
    });
  } else {
    return res
      .status(400)
      .json({ message: "Invalid installment data received!" });
  }
};

// @desc Update a installment
// @route PATCH /installments/:inId
//! @access Private
const updateInstallment = async (req, res) => {
  const { title, percentage } = req.body;

  const { inId } = req.params;

  //* Confirm data

  if (!inId) {
    return res.status(400).json({ message: "Installment ID required!" });
  }

  if (!title || !percentage) {
    return res
      .status(400)
      .json({ message: "Installment title and percentage required!" });
  }

  //? Does the installment exist to update?

  const installment = await prismadb.installment.findUnique({
    where: {
      id: inId,
    },
  });

  if (!installment) {
    return res.status(404).json({ message: "Installment not found!" });
  }

  //* converts
  const percentageDecimal = parseFloat(percentage);

  //* Update installment

  const updatedInstallment = await prismadb.installment.update({
    where: {
      id: inId,
    },
    data: {
      title,
      percentage: percentageDecimal,
    },
  });

  res.json({ message: `Installment ${updatedInstallment.title} updated.` });
};

// @desc Delete a installment
// @route DELETE /installments/:inId
//! @access Private
const deleteInstallment = async (req, res) => {
  const { inId } = req.params;

  //* Confirm data
  if (!inId) {
    return res.status(400).json({ message: "Installment ID required!" });
  }

  //? Does the installment exist to delete?
  const installment = await prismadb.installment.findUnique({
    where: {
      id: inId,
    },
  });

  if (!installment) {
    return res.status(404).json({ message: "Installment not found!" });
  }

  const result = await prismadb.installment.delete({
    where: {
      id: inId,
    },
  });

  res.json({
    message: `Installment ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchInstallments,
  searchInstallmentsByPID,
  getAllInstallments,
  getAllInstallmentsByPID,
  getInstallmentById,
  createNewInstallments,
  updateInstallment,
  deleteInstallment,
};
