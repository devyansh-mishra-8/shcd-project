const SoilScan = require("../models/SoilScan");
const processSoilScan = require("../services/soilScanService");

// CREATE
exports.createSoilScan = async (req, res, next) => {
  try {
    const result = await processSoilScan(req.body);

    const saved = await SoilScan.create(result.raw);

    res.status(201).json({
      success: true,
      message: "Soil scan processed",
      data: {
        id: saved._id,
        display: result.display,
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET ALL
exports.getAllSoilScans = async (req, res, next) => {
  try {
    const scans = await SoilScan.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "All scans fetched",
      data: scans,
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID
exports.getSoilScanById = async (req, res, next) => {
  try {
    const scan = await SoilScan.findById(req.params.id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    res.json({
      success: true,
      message: "Scan fetched",
      data: scan,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteSoilScan = async (req, res, next) => {
  try {
    const scan = await SoilScan.findByIdAndDelete(req.params.id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    res.json({
      success: true,
      message: "Scan deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};