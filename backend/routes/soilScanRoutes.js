const express = require("express");
const router = express.Router();

const {
  createSoilScan,
  getAllSoilScans,
  getSoilScanById,
  deleteSoilScan,
} = require("../controllers/soilScanController");

router.post("/scan", createSoilScan);
router.get("/scan", getAllSoilScans);
router.get("/scan/:id", getSoilScanById);
router.delete("/scan/:id", deleteSoilScan);

module.exports = router;