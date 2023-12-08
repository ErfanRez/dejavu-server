const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const capitalize = require("../utils/capitalizer");

// @desc Get searched agents
// @route GET /agents/search
//! @access Private
const searchAgents = async (req, res) => {
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

  const agents = await prismadb.agent.findMany({
    where: where,
    include: {
      projects: {
        include: {
          images: true,
        },
      },
      saleProps: {
        include: {
          images: true,
        },
      },
      rentProps: {
        include: {
          images: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

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
    include: {
      projects: {
        include: {
          images: true,
        },
      },
      saleProps: {
        include: {
          images: true,
        },
      },
      rentProps: {
        include: {
          images: true,
        },
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
    include: {
      projects: {
        include: {
          images: true,
        },
      },
      saleProps: {
        include: {
          images: true,
        },
      },
      rentProps: {
        include: {
          images: true,
        },
      },
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
  const { name, phone, email, whatsApp } = req.body;

  // console.log(req.files);
  const convertedImage = req.convertedImage;

  //* Confirm data

  if (!name) {
    return res.status(400).json({ message: "Agent name required!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.agent.findUnique({
    where: {
      OR: [
        {
          name,
        },
        {
          email,
        },
      ],
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Agent already exists!" });
  }

  //* Converts
  const capName = capitalize(name);

  //* Create new agent

  const agent = await prismadb.agent.create({
    data: {
      name: capName,
      imageUrl: convertedImage,
      phone,
      email,
      whatsApp,
    },
  });

  if (agent) {
    //*created

    res.status(201).json({ message: `New agent ${capName} created.` });
  } else {
    res.status(400).json({ message: "Invalid agent data received!" });
  }
};

// @desc Update a agent
// @route PATCH /agents/:id
//! @access Private
const updateAgent = async (req, res) => {
  const { name, email, phone, whatsApp } = req.body;
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

  //? Check for duplicate

  const duplicate = await prismadb.agent.findUnique({
    where: {
      OR: [
        {
          name,
        },
        {
          email,
        },
      ],
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Agent already exists!" });
  }

  //* Converts
  const capName = capitalize(name);

  //? Does the agent exist to update?
  const agent = await prismadb.agent.findUnique({
    where: {
      id,
    },
  });

  if (!agent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  if (capName !== agent.name && name !== undefined) {
    //* Check if new image provided
    if (!convertedImage) {
      await renameOldFile("agents", `${agent.name}.webp`, `${capName}.webp`);

      const newImagePath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "images",
          "agents",
          `${capName}.webp`
        )
      ).toString();

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

      await fileDelete(imagesFolder);
    }
  }

  //* Update agent

  const updatedAgent = await prismadb.agent.update({
    where: {
      id,
    },
    data: {
      name: capName,
      imageUrl: convertedImage,
      phone,
      email,
      whatsApp,
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

  const [projects, sales, rents] = await Promise.all([
    prismadb.project.findMany({
      where: {
        agentId: id,
      },
    }),
    prismadb.saleProperty.findMany({
      where: {
        agentId: id,
      },
    }),
    prismadb.rentProperty.findMany({
      where: {
        agentId: id,
      },
    }),
  ]);

  if (projects.length !== 0) {
    return res.status(403).json({
      message:
        "This Agent has connected projects! You should delete them first.",
    });
  }

  if (sales.length !== 0) {
    return res.status(403).json({
      message:
        "This Agent has connected properties! You should delete them first.",
    });
  }

  if (rents.length !== 0) {
    return res.status(403).json({
      message:
        "This Agent has connected properties! You should delete them first.",
    });
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

  await fileDelete(imagesFolder);

  res.json({
    message: `Agent ${result.name} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchAgents,
  getAgentById,
  getAllAgents,
  createNewAgent,
  updateAgent,
  deleteAgent,
};
