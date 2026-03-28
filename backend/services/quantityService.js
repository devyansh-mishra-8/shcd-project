const cropData = require("../data/cropData.json");

function calculateQuantity(soilData, analysis, fertilizers, selectedCrop) {
  const result = [];
  const crop = cropData[selectedCrop];

  if (!crop) {
    throw new Error("Invalid crop selected");
  }

  for (const fert of fertilizers) {
    const nutrient = fert.nutrient;
    const level = fert.level;

    // 🟢 MACRONUTRIENTS
    if (["nitrogen", "phosphorus", "potassium"].includes(nutrient)) {
      const required = crop[nutrient] || 0;
      const available = soilData[nutrient] || 0;

      let deficiency = Math.max(required - available, 0);

      // ✅ Medium logic (50% reduction)
      if (level === "Medium") {
        deficiency = deficiency * 0.5;
      }

      // ✅ Zero deficiency handling (FIXED + SMART NOTE)
      if (deficiency === 0) {
        result.push({
          ...fert,
          recommendation: "No application needed",
          required,
          available,
          deficiency: 0,
          quantityKgPerHa: 0,
          unit: "kg/ha",
          priority: "Low",
          note:
            level === "Low"
              ? "Soil level low but crop requirement already satisfied"
              : "Soil level sufficient for crop requirement",
        });
        continue;
      }

      const quantity = ((deficiency * 100) / fert.percentage).toFixed(2);

      result.push({
        ...fert,
        required,
        available,
        deficiency,
        quantityKgPerHa: Number(quantity),
        unit: "kg/ha",
        priority: level === "Low" ? "High" : "Medium",
      });
    }

    // 🔵 MICRONUTRIENTS (SMART DOSES)
    else {
      const doses = {
        zinc: 25,
        boron: 10,
        iron: 50,
        manganese: 20,
        copper: 10,
        sulphur: 20,
      };

      result.push({
        ...fert,
        quantityKgPerHa: doses[nutrient] || 25,
        unit: "kg/ha",
        priority: "High",
        note: "Recommended standard dose",
      });
    }
  }

  return result;
}

module.exports = { calculateQuantity };