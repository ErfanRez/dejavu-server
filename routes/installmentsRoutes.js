const express = require("express");
const router = express.Router();
const installmentsController = require("../controllers/installmentsController");

router
  .get("/search", installmentsController.searchInstallments)
  .get("/:pId/search", installmentsController.searchInstallmentsByPID)
  .get("/", installmentsController.getAllInstallments)
  .get("/:pId", installmentsController.getAllInstallmentsByPID)
  .get("/:inId", installmentsController.getInstallmentById)
  .post("/:pId", installmentsController.createNewInstallment)
  .patch("/:inId", installmentsController.updateInstallment)
  .delete("/:inId", installmentsController.deleteInstallment);

module.exports = router;
