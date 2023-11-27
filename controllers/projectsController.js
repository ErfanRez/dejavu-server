const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const renameOldPdf = require("../utils/renameOldPdf");
const fs = require("fs");

// @desc Get searched projects
// @route GET /projects/search
//! @access Public
const searchProjects = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

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

  const projects = await prismadb.project.findMany({
    where: where,
    take: limit,
    include: {
      agent: true,
      images: true,
      installments: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  if (!projects?.length) {
    return res.status(404).json({ message: "No projects found!" });
  }

  res.json(projects);
};

// @desc Get an unique project
// @route GET /projects/:id
//! @access Public
const getProjectById = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Project ID Required!" });
  }

  //? Does the project exist?
  const project = await prismadb.project.findUnique({
    where: {
      id,
    },
    include: {
      agent: true,
      images: true,
      installments: true,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  res.json(project);
};

// @desc Get all projects
// @route GET /projects
//! @access Public
const getAllProjects = async (req, res) => {
  //* Get all projects from DB

  // Get the limit value from req.query
  const limit = parseInt(req.query.limit) || 20;

  const projects = await prismadb.project.findMany({
    take: limit,
    include: {
      agent: true,
      images: true,
      installments: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  //* If no projects

  if (!projects?.length) {
    return res.status(404).json({ message: "No projects found!" });
  }

  res.json(projects);
};

// @desc Create new project
// @route POST /project
//! @access Private
const createNewProject = async (req, res) => {
  const {
    title,
    owner,
    city,
    country,
    location,
    category,
    mapUrl,
    offPlan,
    completionDate,
    description,
    amenities,
    agentId,
  } = req.body;

  // console.log(req.files);
  const convertedImages = req.convertedImages;
  const pdfUrl = req.pdfUrl;

  //* Confirm data

  if (
    !title ||
    !owner ||
    !city ||
    !country ||
    !location ||
    !category ||
    !mapUrl ||
    !amenities ||
    !agentId
  ) {
    return res.status(400).json({ message: "All fields required!" });
  }

  //? Does the agent exist?
  const agent = await prismadb.agent.findUnique({
    where: {
      id: agentId,
    },
  });

  if (!agent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  //? Check for duplicate

  const duplicate = await prismadb.project.findUnique({
    where: {
      title,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Project title already exists!" });
  }

  //* converts

  offPlan
    ? (offPlanBoolean = JSON.parse(offPlan))
    : (offPlanBoolean = undefined);

  //* Create new project

  const project = await prismadb.project.create({
    data: {
      title,
      owner,
      city,
      country,
      location,
      category,
      mapUrl,
      offPlan: offPlanBoolean,
      completionDate,
      description,
      amenities,
      pdfUrl,
      agent: {
        connect: {
          id: agentId,
        },
      },
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
  });

  if (project) {
    //*created

    res.status(201).json({ message: `New project ${title} created.` });
  } else {
    res.status(400).json({ message: "Invalid project data received!" });
  }
};

// @desc Update a project
// @route PATCH /projects/:id
//! @access Private
const updateProject = async (req, res) => {
  const {
    title,
    owner,
    city,
    country,
    location,
    category,
    mapUrl,
    offPlan,
    completionDate,
    description,
    amenities,
  } = req.body;

  const { id } = req.params;

  let convertedImages = req.convertedImages;
  let pdfUrl = req.pdfUrl;

  //* Confirm data

  if (!id) {
    return res.status(400).json({ message: "Project ID required!" });
  }

  if (!title) {
    return res.status(400).json({ message: "Title required!" });
  }

  //? Does the project exist to update?

  const project = await prismadb.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  if (title !== project.title && title !== undefined) {
    //* Check if new images provided
    if (convertedImages.length === 0) {
      renameOldFile("projects", project.title, title);

      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "projects",
        title
      );

      // Check if the folder exists
      if (fs.existsSync(imagesFolder)) {
        // List all files in the folder
        const files = fs.readdirSync(imagesFolder);

        // Create an array of file paths
        const outputImageURL = new URL(
          path.join(
            process.env.ROOT_PATH,
            "uploads",
            "images",
            "projects",
            title
          )
        ).toString();

        convertedImages = files.map((file) => path.join(outputImageURL, file));
      }
    } else {
      // Define the path to the project's images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "projects",
        project.title
      );

      fileDelete(imagesFolder);
    }

    //* Check if new pdf provided
    if (!pdfUrl) {
      renameOldPdf(`${project.title}.pdf`, `${title}.pdf`);

      const newPdfPath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "factSheets",
          `${title}.pdf`
        )
      ).toString();

      pdfUrl = newPdfPath;
    } else {
      // Define the path to the factSheets folder
      const pdfFile = path.join(
        __dirname,
        "..",
        "uploads",
        "factSheets",
        `${project.title}.pdf`
      );

      fileDelete(pdfFile);
    }
  }

  //* converts

  offPlan
    ? (offPlanBoolean = JSON.parse(offPlan))
    : (offPlanBoolean = undefined);

  //* Update project

  await prismadb.project.update({
    where: {
      id,
    },
    data: {
      title,
      owner,
      city,
      country,
      location,
      category,
      mapUrl,
      offPlan: offPlanBoolean,
      completionDate,
      description,
      amenities,
      pdfUrl,
      images: {
        deleteMany: {},
      },
    },
  });

  const updatedProject = await prismadb.project.update({
    where: {
      id,
    },
    data: {
      images: {
        create: convertedImages.map((url) => ({
          url,
        })),
      },
    },
  });

  res.json({ message: `project ${updatedProject.title} updated.` });
};

// @desc Update a project
// @route PATCH /projects/:id
//! @access Private
const updateProjectAgent = async (req, res) => {
  const { id } = req.params;
  const { agentId } = req.body;

  // Confirm data
  if (!agentId) {
    return res.status(400).json({ message: "Agent ID is required!" });
  }

  // Check if the project exists
  const existingProject = await prismadb.project.findUnique({
    where: {
      id,
    },
    include: {
      agent: true,
    },
  });

  if (!existingProject) {
    return res.status(404).json({ message: "Project not found!" });
  }

  // Check if the new agent exists
  const newAgent = await prismadb.agent.findUnique({
    where: {
      id: agentId,
    },
  });

  if (!newAgent) {
    return res.status(404).json({ message: "Agent not found!" });
  }

  // Update the project with the new agent
  const updatedProject = await prismadb.project.update({
    where: {
      id: projectId,
    },
    data: {
      agent: {
        connect: {
          id: agentId,
        },
      },
    },
  });

  if (updatedProject) {
    res
      .status(200)
      .json({ message: `Agent for project ${existingProject.title} updated.` });
  } else {
    res.status(400).json({ message: "Failed to update project agent." });
  }
};

// @desc Delete a project
// @route DELETE /projects/:id
//! @access Private
const deleteProject = async (req, res) => {
  const { id } = req.params;

  //* Confirm data
  if (!id) {
    return res.status(400).json({ message: "Project ID required!" });
  }

  //? Does the project exist to delete?
  const project = await prismadb.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  const result = await prismadb.project.delete({
    where: {
      id,
    },
  });

  // Define the path to the project's images folder
  const imagesFolder = path.join(
    __dirname,
    "..",
    "uploads",
    "images",
    "projects",
    result.title
  );

  fileDelete(imagesFolder);

  // Define the path to the project's pdf file
  const pdfFile = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    `${result.title}.pdf`
  );

  fileDelete(pdfFile);

  res.json({
    message: `Project ${result.title} with ID: ${result.id} deleted.`,
  });
};

module.exports = {
  searchProjects,
  getProjectById,
  getAllProjects,
  createNewProject,
  updateProject,
  updateProjectAgent,
  deleteProject,
};
