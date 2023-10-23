const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");

// @desc Get searched agents
// @route GET /agents/search
//! @access Private
const searchAgentsByName = async (req, res) => {
  const searchString = req.query.q; //* Get the search string from query params

  if (!searchString) {
    return res
      .status(400)
      .json({ error: "Search query parameter is missing." });
  }

  const agents = await prismadb.agent.findMany({
    where: {
      name: {
        contains: searchString,
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no agents

  if (!agents?.length) {
    return res.status(404).json({ message: "No agents found!" });
  }

  res.json(agents);
};

// @desc Get all agents
// @route GET /agents
//! @access Public
const getAllAgents = async (req, res) => {
  //* Get all agents from DB

  const agents = await prismadb.agent.findMany({
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no agents

  if (!agents?.length) {
    return res.status(404).json({ message: "No agents found!" });
  }

  res.json(agents);
};

// @desc Get an unique agent
// @route GET /agents/:id
//! @access Public
const getAgentById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Agent ID Required!" });
  }

  //? Does the agent exist?
  const agent = await prismadb.agent.findUnique({
    where: {
      id,
    },
  });

  if (!agent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  res.json(agent);
};

// @desc Create new agent
// @route POST /agent
//! @access Private
const createNewAgent = async (req, res) => {
  const { name, phone, email, whatsapp } = req.body;

  // console.log(req.files);
  const convertedImage = req.convertedImage;

  //* Confirm data

  if (!name) {
    return res.status(400).json({ message: "Agent name required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.agent.findUnique({
    where: {
      name,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Agent name already exists!" });
  }

  //* Create new agent

  const agent = await prismadb.agent.create({
    data: {
      name,
      imageUrl: convertedImage,
      phone,
      email,
      whatsapp,
    },
  });

  if (agent) {
    //*created

    res.status(201).json({ message: `New agent ${name} created.` });
  } else {
    res.status(400).json({ message: "Invalid agent data received!" });
  }
};

// @desc Update a agent
// @route PATCH /agents/:id
//! @access Private
const updateAgent = async (req, res) => {
  const { name, email, phone, whatsapp } = req.body;
  const { id } = req.params;

  // console.log(req.files);

  let convertedImage = req.convertedImage;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Agent ID required!" });
  }

  if (!name) {
    return res.status(400).json({ message: "Agent name required!" });
  }

  //? Does the agent exist to update?
  const agent = await prismadb.agent.findUnique({
    where: {
      id,
    },
  });

  if (!agent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  if (name !== agent.name && name !== undefined) {
    //* Check if new image provided
    if (!convertedImage) {
      renameOldFile("agents", `${agent.name}.webp`, `${name}.webp`);

      const newImagePath = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "agents",
        `${name}.webp`
      );

      convertedImage = newImagePath;
    } else {
      // Define the path to the agent's images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "agents",
        `${agent.name}.webp`
      );

      fileDelete(imagesFolder);
    }
  }

  //* Update agent

  const updatedAgent = await prismadb.agent.update({
    where: {
      id,
    },
    data: {
      name,
      imageUrl: convertedImage,
      phone,
      email,
      whatsapp,
    },
  });

  res.json({ message: `agent ${updatedAgent.name} updated.` });
};

// @desc Delete a agent
// @route DELETE /agents/:id
//! @access Private
const deleteAgent = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Agent ID required!" });
  }

  //? Does the agent exist to delete?
  const agent = await prismadb.agent.findUnique({
    where: {
      id,
    },
  });

  if (!agent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  const result = await prismadb.agent.delete({
    where: {
      id,
    },
  });

  // Define the path to the agent's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "agents",
    `${result.name}.webp`
  );

  fileDelete(imagesFolder);

  res.json({
    message: `Agent ${result.name} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchAgentsByName,
  getAgentById,
  getAllAgents,
  createNewAgent,
  updateAgent,
  deleteAgent,
};
