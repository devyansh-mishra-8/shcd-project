const fertilizerData = require("../data/fertilizerData.json");

const macronutrients = ["nitrogen", "phosphorus", "potassium"];
const secondaryNutrients = ["sulphur"];
const micronutrients = ["zinc", "boron", "iron", "manganese", "copper"];

const microDose = {
  zinc: 25,
  boron: 10,
  iron: 50,
  manganese: 25,
  copper: 10,
  sulphur: 20,
};

function getBestFertilizer(nutrient) {
  let best = null;

  for (const fertName in fertilizerData) {
    const fert = fertilizerData[fertName];

    if (fert[nutrient] && fert[nutrient] > 0) {
      if (!best || fert[nutrient] > best.percentage) {
        best = {
          name: fertName,
          percentage: fert[nutrient],
          type: fert.type,
        };
      }
    }
  }

  return best;
}

function getFertilizerRecommendation(analysis) {
  const fertilizers = [];

  for (const nutrient in analysis) {
    const level = analysis[nutrient];

    // MACRO
    if (macronutrients.includes(nutrient)) {
      if (level === "High") continue;

      const best = getBestFertilizer(nutrient);

      if (best) {
        fertilizers.push({
          name: best.name,
          nutrient,
          level,
          recommendation:
            level === "Low" ? "Full Dose" : "Reduced Dose",
          percentage: best.percentage,
          type: best.type,
        });
      }
    }

    // MICRO + SECONDARY
    if (
      micronutrients.includes(nutrient) ||
      secondaryNutrients.includes(nutrient)
    ) {
      if (level === "High") continue;

      const best = getBestFertilizer(nutrient);

      if (best) {
        let dose = microDose[nutrient] || 0;

        if (level === "Medium") {
          dose = Math.round(dose * 0.6);
        }

        fertilizers.push({
          name: best.name,
          nutrient,
          level,
          recommendation: "Apply Nutrient",
          percentage: best.percentage,
          type: best.type,
          baseDose: dose,
        });
      }
    }
  }

  return fertilizers;
}

module.exports = { getFertilizerRecommendation };