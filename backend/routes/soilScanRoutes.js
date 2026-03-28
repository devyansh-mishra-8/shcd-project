const express = require("express");
const {
  createSoilScan,
  getAllSoilScans,
} = require("../controllers/soilScanController");

const router = express.Router();

// Create scan
router.post("/scan", createSoilScan);

// Get all scans
router.get("/scan", getAllSoilScans);

module.exports = router;