const express = require("express");

const {
  createSoilScan,
  getAllSoilScans,
  getSoilScanById,
} = require("../controllers/soilScanController");

const router = express.Router();

// Create scan
router.post("/scan", createSoilScan);

// Get all scans
router.get("/scan", getAllSoilScans);

// Get scan by ID
router.get("/scan/:id", getSoilScanById);

module.exports = router;