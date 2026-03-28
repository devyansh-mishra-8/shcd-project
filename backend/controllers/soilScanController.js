const SoilScan = require("../models/SoilScan");
const { analyzeSoil } = require("../services/soilAnalysisService");
const { getFertilizerRecommendation } = require("../services/fertilizerService");
const { calculateQuantity } = require("../services/quantityService");
const { calculateCost } = require("../services/costService");
const { formatOutput } = require("../services/outputFormatterService");
const { generateSchedule } = require("../services/scheduleService");
const cropData = require("../data/cropData.json");

// ✅ CREATE Soil Scan
async function createSoilScan(req, res) {
  try {
    const {
      farmerInfo = {},
      soilSample = {},
      soilData,
      selectedCrop,
    } = req.body;

    if (!soilData) {
      return res.status(400).json({ message: "Soil data is required" });
    }

    if (!selectedCrop) {
      return res.status(400).json({ message: "Crop is required" });
    }

    if (!cropData[selectedCrop]) {
      return res.status(400).json({ message: "Invalid crop selected" });
    }

    const analysis = analyzeSoil(soilData);

    const fertilizers = getFertilizerRecommendation(analysis);

    const finalFertilizers = calculateQuantity(
      soilData,
      analysis,
      fertilizers,
      selectedCrop
    );

    const filteredFertilizers = finalFertilizers.filter(
      (f) => f.quantityKgPerHa > 0
    );

    const farmSize = soilSample?.farmSize || 1;

    const costResult = calculateCost(filteredFertilizers, farmSize);

    const schedule = generateSchedule({
      crop: selectedCrop,
      analysis,
      fertilizers: filteredFertilizers,
    });

    const formatted = formatOutput({
      analysis,
      fertilizers: filteredFertilizers,
      cost: costResult,
      soilData,
      soilSample,
    });

    const savedScan = await SoilScan.create({
      farmerInfo,
      soilSample,
      soilData,
      selectedCrop,
      analysis,
      recommendations: {
        fertilizers: filteredFertilizers,
        schedule,
      },
      cost: costResult,
    });

    return res.status(201).json({
      message: "Soil scan processed successfully",
      data: {
        id: savedScan._id,
        display: formatted,
      },
    });
  } catch (error) {
    console.error("Create Soil Scan Error:", error);

    return res.status(500).json({
      message: "Server error while processing soil scan",
    });
  }
}

// ✅ GET ALL Soil Scans
async function getAllSoilScans(req, res) {
  try {
    const scans = await SoilScan.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All soil scans fetched successfully",
      data: scans,
    });
  } catch (error) {
    console.error("Get All Soil Scans Error:", error);

    return res.status(500).json({
      message: "Server error while fetching soil scans",
    });
  }
}

// ✅ GET Soil Scan by ID
async function getSoilScanById(req, res) {
  try {
    const { id } = req.params;

    const scan = await SoilScan.findById(id);

    if (!scan) {
      return res.status(404).json({
        message: "Soil scan not found",
      });
    }

    return res.status(200).json({
      message: "Soil scan fetched successfully",
      data: scan,
    });
  } catch (error) {
    console.error("Get Soil Scan By ID Error:", error);

    return res.status(500).json({
      message: "Server error while fetching soil scan",
    });
  }
}

module.exports = {
  createSoilScan,
  getAllSoilScans,
  getSoilScanById,
};