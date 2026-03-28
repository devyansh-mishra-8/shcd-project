const SoilScan = require("../models/SoilScan");
const { analyzeSoil } = require("../services/soilAnalysisService");
const { getFertilizerRecommendation } = require("../services/fertilizerService");
const { calculateQuantity } = require("../services/quantityService");
const { calculateCost } = require("../services/costService");
const { formatOutput } = require("../services/outputFormatterService");
const { generateSchedule } = require("../services/scheduleService");
const cropData = require("../data/cropData.json");

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

    const crop = selectedCrop || "wheat";

    if (!cropData[crop]) {
      return res.status(400).json({ message: "Invalid crop selected" });
    }

    const analysis = analyzeSoil(soilData);
    const fertilizers = getFertilizerRecommendation(analysis);

    const finalFertilizers = calculateQuantity(
      soilData,
      analysis,
      fertilizers,
      crop
    );

    const filteredFertilizers = finalFertilizers.filter(
      (f) => f.quantityKgPerHa > 0
    );

    const farmSize = soilSample?.farmSize || 1;

    const costResult = calculateCost(filteredFertilizers, farmSize);

    const schedule = generateSchedule({
      crop,
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

    await SoilScan.create({
      farmerInfo,
      soilSample,
      soilData,
      selectedCrop: crop,
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
        display: formatted,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error while processing soil scan",
    });
  }
}

async function getAllSoilScans(req, res) {
  try {
    const scans = await SoilScan.find().sort({ createdAt: -1 });

    return res.status(200).json({
      message: "All soil scans fetched successfully",
      data: scans,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error while fetching soil scans",
    });
  }
}

module.exports = { createSoilScan, getAllSoilScans };