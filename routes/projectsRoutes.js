const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");
const uploadPdf = require("../middlewares/fileUploader");

router
  .use(fileUpload())
  //! Properties Routes /properties/
  .get("/search", projectsController.searchProjects)
  .get("/", projectsController.getAllProjects)
  .get("/:id", projectsController.getProjectById)
  .post(
    "/",
    uploadPdf,
    uploadPic("projects"),
    projectsController.createNewProject
  )
  .patch(
    "/:id",
    uploadPdf,
    uploadPic("projects"),
    projectsController.updateProject
  )
  .patch("/:id", projectsController.updateProjectAgent)
  .delete("/:id", projectsController.deleteProject);

module.exports = router;
