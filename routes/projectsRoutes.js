const express = require("express");
const router = express.Router();
const projectsController = require("../controllers/projectsController");
const uploadPic = require("../middlewares/propertyPics");
const fileUpload = require("express-fileupload");
const uploadPdf = require("../middlewares/fileUploader");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .use(fileUpload())
  //! Properties Routes /projects/
  .get("/search", projectsController.searchProjects)
  .get("/", projectsController.getAllProjects)
  .get("/:id", projectsController.getProjectById)
  .use(verifyJWT)
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
  .patch("/agent/:id", projectsController.updateProjectAgent)
  .delete("/:id", projectsController.deleteProject)
  .delete("/", projectsController.deleteProjects);

module.exports = router;
