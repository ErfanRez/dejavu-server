const prismadb = require("../lib/prismadb");

// @desc Get an unique agent
// @route GET /agents/:id
//! @access Public
const getAgentById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Agent ID Required!" });
  }

  // ? Does the agent still have assigned relations?

  //* Does the agent exist to delete?
  const agent = await prismadb.agent.findUnique({
    where: {
      id,
    },
  });

  if (!agent) {
    return res.status(400).json({ message: "Agent not found!" });
  }

  res.json(agent);
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
    return res.status(400).json({ message: "No agents found" });
  }

  res.json(agents);
};

// @desc Create new agent
// @route POST /agent
//! @access Public
const createNewAgent = async (req, res) => {
  const { name } = req.body;

  // console.log(req.files);
  const convertedImage = req.convertedImages;

  //* Confirm data

  if (!name || !convertedImage) {
    res.status(400).json({ message: "Agent name and picture required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.agent.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "agent title already exists!" });
  }

  //* Create new agent

  const agent = await prismadb.agent.create({
    data: {
      name,
      imageUrl: convertedImage,
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
//! @access Public
const updateAgent = async (req, res) => {
  const { name } = req.body;
  const { id } = req.params;

  // console.log(req.files);
  const convertedImage = req.convertedImages;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Agent ID required!" });
  }

  if (!name || !convertedImage) {
    res.status(400).json({ message: "Agent name and picture required!" });
  }

  //* Update agent

  const updatedAgent = await prismadb.agent.update({
    data: {
      name,
      imageUrl: convertedImage,
    },
  });

  res.json({ message: `agent ${updatedAgent.name} updated.` });
};

// @desc Delete a agent
// @route DELETE /agents/:id
//! @access Public
const deleteAgent = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Agent ID required!" });
  }

  //* Does the agent exist to delete?
  const agent = await prismadb.agent.findUnique({
    where: {
      id,
    },
  });

  if (!agent) {
    return res.status(400).json({ message: "Agent not found!" });
  }

  const result = await prismadb.agent.delete({
    where: {
      id,
    },
  });

  res.json({
    message: `Agent ${result.name} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  getAgentById,
  getAllAgents,
  createNewAgent,
  updateAgent,
  deleteAgent,
};
