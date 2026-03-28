const standards = require("../data/soilStandards.json");

function classify(value, low, high) {
  if (value < low) return "Low";
  if (value <= high) return "Medium";
  return "High";
}

function classifyPH(value, config) {
  if (value < config.low) return config.labels.low;
  if (value <= config.high) return config.labels.medium;
  return config.labels.high;
}

function analyzeSoil(soilData) {
  const analysis = {};

  for (const key in standards) {
    const config = standards[key];
    const value = soilData[key];

    if (value === undefined || value === null) continue;

    if (key === "ph") {
      analysis[key] = classifyPH(value, config);
    } else {
      analysis[key] = classify(value, config.low, config.high);
    }
  }

  return analysis;
}

module.exports = { analyzeSoil };