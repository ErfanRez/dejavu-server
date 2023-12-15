const express = require("express");
const router = express.Router();
const installmentsController = require("../controllers/installmentsController");
const verifyJWT = require("../middlewares/verifyJWT");

router
  .get("/", installmentsController.getAllInstallments)
  .get("/:pId", installmentsController.getAllInstallmentsByPID)
  .get("/get-one/:inId", installmentsController.getInstallmentById)
  .use(verifyJWT)
  .post("/:pId", installmentsController.createNewInstallments)
  .patch("/:inId", installmentsController.updateInstallment)
  .delete("/:inId", installmentsController.deleteInstallment);

module.exports = router;
