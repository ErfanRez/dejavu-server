const prismadb = require("../lib/prismadb");
const path = require("path");
const fileDelete = require("../utils/fileDelete");
const renameOldFile = require("../utils/renameOldFile");
const renameOldPdf = require("../utils/renameOldPdf");
const fsPromises = require("fs").promises;
const fs = require("fs");
const capitalize = require("../utils/capitalizer");

// @desc Get searched projects
// @route GET /projects/search
//! @access Public
const searchProjects = async (req, res) => {
  const searchParams = req.query; // Get the search parameters from query params

  // // Get the limit value from req.query
  // const limit = parseInt(req.query.limit) || 20;

  if (Object.keys(searchParams).length === 0) {
    return res.status(400).json({ error: "No search parameters provided." });
  }

  const where = {};

  const capParam = searchParams[param]
    ? capitalize(searchParams[param])
    : searchParams[param];

  for (const param in searchParams) {
    if (searchParams[param]) {
      where[param] = {
        contains: capParam,
      };
    }
  }

  const projects = await prismadb.project.findMany({
    where: where,
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

  const projects = await prismadb.project.findMany({
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

  //* converts

  const capTitle = capitalize(title);

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
      title: capTitle,
    },
  });

  if (duplicate) {
    return res.status(409).json({ message: "Project title already exists!" });
  }

  //* converts

  const capOwner = capitalize(owner);
  const capCity = capitalize(city);
  const capCountry = capitalize(country);

  const offPlanBoolean = offPlan ? JSON.parse(offPlan) : undefined;

  //* Create new project

  const project = await prismadb.project.create({
    data: {
      title: capTitle,
      owner: capOwner,
      city: capCity,
      country: capCountry,
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

  const capTitle = capitalize(title);

  //? Does the project exist to update?

  const project = await prismadb.project.findUnique({
    where: {
      id,
    },
  });

  if (!project) {
    return res.status(404).json({ message: "Project not found!" });
  }

  if (capTitle !== project.title && title !== undefined) {
    //* Check if new images provided
    if (convertedImages.length === 0) {
      await renameOldFile("projects", project.title, capTitle, res);

      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "projects",
        capTitle
      );

      // Check if the folder exists
      if (fs.existsSync(imagesFolder)) {
        try {
          // List all files in the folder
          const files = await fsPromises.readdir(imagesFolder);

          // Create an array of file paths
          const outputImageURL = new URL(
            path.join(
              process.env.ROOT_PATH,
              "uploads",
              "images",
              "projects",
              capTitle
            )
          ).toString();

          convertedImages = files.map((file) =>
            path.join(outputImageURL, file)
          );
        } catch (error) {
          console.error("Error reading files from folder:", error);
          res.status(500).json({ message: "Internal Server Error" });
        }
      }
    } else {
      // Define the path to the images folder
      const imagesFolder = path.join(
        __dirname,
        "..",
        "uploads",
        "images",
        "projects",
        project.title
      );

      await fileDelete(imagesFolder, res);
    }

    //* Check if new pdf provided
    if (!pdfUrl) {
      await renameOldPdf(`${project.title}.pdf`, `${capTitle}.pdf`, res);

      const newPdfPath = new URL(
        path.join(
          process.env.ROOT_PATH,
          "uploads",
          "factSheets",
          `${capTitle}.pdf`
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

      await fileDelete(pdfFile, res);
    }
  } else {
    const imagesFolder = path.join(
      __dirname,
      "..",
      "uploads",
      "images",
      "projects",
      project.title
    );
    // Check if the folder exists
    if (fs.existsSync(imagesFolder)) {
      try {
        // List all files in the folder
        const files = await fsPromises.readdir(imagesFolder);

        // Create an array of file paths
        const outputImageURL = new URL(
          path.join(
            process.env.ROOT_PATH,
            "uploads",
            "images",
            "projects",
            project.title
          )
        ).toString();

        convertedImages = files.map((file) => path.join(outputImageURL, file));
      } catch (error) {
        console.error("Error reading files from folder:", error);
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  }

  //* converts
  const capOwner = capitalize(owner);
  const capCity = capitalize(city);
  const capCountry = capitalize(country);

  const offPlanBoolean = offPlan ? JSON.parse(offPlan) : undefined;

  //* Update project

  await prismadb.project.update({
    where: {
      id,
    },
    data: {
      title: capTitle,
      owner: capOwner,
      city: capCity,
      country: capCountry,
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
      id,
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

  await fileDelete(imagesFolder);

  // Define the path to the project's pdf file
  const pdfFile = path.join(
    __dirname,
    "..",
    "uploads",
    "factSheets",
    `${result.title}.pdf`
  );

  await fileDelete(pdfFile);

  res.json({
    message: `Project ${result.title} with ID: ${result.id} deleted.`,
  });
};

// @desc Delete projects
// @route DELETE /projects
//! @access Private
const deleteProjects = async (req, res) => {
  const { ids } = req.body;

  //* Confirm data
  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res
      .status(400)
      .json({ message: "Project IDs required in an array!" });
  }

  for (const id of ids) {
    //? Does the project exist to delete?
    const project = await prismadb.project.findUnique({
      where: {
        id,
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ message: `Project with ID ${id} not found!` });
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

    await fileDelete(imagesFolder);

    // Define the path to the project's pdf file
    const pdfFile = path.join(
      __dirname,
      "..",
      "uploads",
      "factSheets",
      `${result.title}.pdf`
    );

    await fileDelete(pdfFile);
  }

  res.json({
    message: "Projects deleted successfully.",
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
  deleteProjects,
};
