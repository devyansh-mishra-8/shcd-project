const { analyzeSoil } = require("./soilAnalysisService");
const { getFertilizerRecommendation } = require("./fertilizerService");
const { calculateQuantity } = require("./quantityService");
const { calculateCost } = require("./costService");
const { formatOutput } = require("./outputFormatterService");
const { generateSchedule } = require("./scheduleService");
const cropData = require("../data/cropData.json");

module.exports = async function processSoilScan(input) {
  const { soilData, selectedCrop, farmerInfo, soilSample } = input;

  if (!soilData) throw new Error("Soil data required");
  if (!selectedCrop) throw new Error("Crop required");

  if (!cropData[selectedCrop]) {
    throw new Error("Invalid crop");
  }

  const analysis = analyzeSoil(soilData);

  const fertilizers = getFertilizerRecommendation(analysis);

  const quantified = calculateQuantity(
    soilData,
    analysis,
    fertilizers,
    selectedCrop
  );

  const filtered = quantified.filter((f) => f.quantityKgPerHa > 0);

  const cost = calculateCost(filtered, soilSample?.farmSize || 1);

  const schedule = generateSchedule({
    crop: selectedCrop,
    analysis,
    fertilizers: filtered,
  });

  const display = formatOutput({
    analysis,
    fertilizers: filtered,
    cost,
    soilData,
    soilSample,
  });

  return {
    raw: {
      farmerInfo,
      soilSample,
      soilData,
      selectedCrop,
      analysis,
      recommendations: {
        fertilizers: filtered,
        schedule,
      },
      cost,
    },
    display,
  };
};