const mongoose = require("mongoose");
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
    const scans = await SoilScan.find()
      .select("_id selectedCrop createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: "All scans fetched",
      data: scans,
    });
  } catch (err) {
    next(err);
  }
};

// GET BY ID (FIXED)
exports.getSoilScanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // ✅ ID validation
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan ID",
      });
    }

    const scan = await SoilScan.findById(id);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found",
      });
    }

    // ✅ Recreate display format (IMPORTANT)
    const display = {
      analysis: Object.entries(scan.analysis).map(([key, value]) => ({
        nutrient: key,
        level: value,
      })),
      recommendations: scan.recommendations.fertilizers.map((f) => ({
        fertilizer: f.name.toUpperCase(),
        quantity: Math.round(f.quantityKgPerHa / 2.5),
        unit: "kg/acre",
        message: `Apply ${Math.round(
          f.quantityKgPerHa / 2.5
        )} kg ${f.name.toUpperCase()} per acre.`,
      })),
      cost: {
        total: scan.cost?.farm?.totalCost || 0,
      },
    };

    res.json({
      success: true,
      message: "Scan fetched",
      data: {
        raw: scan,
        display,
      },
    });
  } catch (err) {
    next(err);
  }
};

// DELETE
exports.deleteSoilScan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid scan ID",
      });
    }

    const scan = await SoilScan.findByIdAndDelete(id);

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