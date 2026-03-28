const cropSchedule = require("../data/cropSchedule.json");

// ✅ CLEAN + CORRECT SPLIT CONFIG
const nutrientSplits = {
  wheat: {
    nitrogen: {
      Basal: 0.4,
      "Crown Root Initiation": 0.3,
      "First Node Stage": 0.3,
    },
    phosphorus: { Basal: 1 },
    potassium: { Basal: 1 },
    sulphur: { Basal: 1 },
  },

  rice: {
    nitrogen: {
      Basal: 0.4,
      Tillering: 0.3,
      "Panicle Initiation": 0.3,
    },
    phosphorus: { Basal: 1 },
    potassium: { Basal: 1 },
  },

  maize: {
    nitrogen: {
      Basal: 0.25,
      "Knee-High Stage": 0.5,
      Tasseling: 0.25,
    },
    phosphorus: { Basal: 1 },
    potassium: { Basal: 1 },
  },

  cotton: {
    nitrogen: {
      Basal: 0.3,
      "Vegetative Growth": 0.3,
      Flowering: 0.25,
      "Boll Formation": 0.15,
    },
    phosphorus: { Basal: 1 },
    potassium: {
      Basal: 0.5,
      "Boll Formation": 0.5,
    },
  },

  soybean: {
    nitrogen: {
      Basal: 0.5,
      "Vegetative Growth": 0.5,
    },
    phosphorus: { Basal: 1 },
    potassium: { Basal: 1 },
    sulphur: { Basal: 1 },
  },

  mustard: {
    nitrogen: {
      Basal: 0.5,
      "First Irrigation": 0.5,
    },
    phosphorus: { Basal: 1 },
    potassium: { Basal: 1 },
    sulphur: { Basal: 1 },
  },

  bajra: {
    nitrogen: {
      Basal: 0.5,
      Tillering: 0.25,
      "Knee-High Stage": 0.25,
    },
    phosphorus: { Basal: 1 },
    potassium: { Basal: 1 },
  },
};

//
// 🔥 FUNCTION (EXISTING)
// Converts kg/ha → kg/acre
//
function convertToAcre(kgPerHa) {
  return +(kgPerHa * 0.4).toFixed(0);
}

//
// 🔥 NEW FUNCTION (FIXED USAGE)
// Converts fertilizer name to readable format
//

function formatFertilizerName(name) {
  const specialCases = {
    urea: "Urea",
    dap: "DAP",
    mop: "MOP",
    gypsum: "Gypsum",
  };

  if (specialCases[name]) return specialCases[name];

  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// 🔥 NEW FUNCTION (TIMING FORMATTER)
function formatTiming(timing) {
  if (!timing) return { text: "", preposition: "at" };

  // DAS → days after sowing
  if (timing.includes("DAS")) {
    const days = timing.replace("DAS", "").trim();
    return {
      text: `${days} days after sowing`,
      preposition: "at",
    };
  }

  // DAT → days after transplanting
  if (timing.includes("DAT")) {
    const days = timing.replace("DAT", "").trim();
    return {
      text: `${days} days after transplanting`,
      preposition: "at",
    };
  }

  // Before sowing → NO "at"
  if (timing.toLowerCase().includes("before")) {
    return {
      text: "before sowing",
      preposition: "",
    };
  }

  // Default
  return {
    text: timing,
    preposition: "at",
  };
}

function generateStageMessage(fertilizers, timing) {
  if (!fertilizers.length) return null;

  const parts = fertilizers.map((f) => {
    const qty = convertToAcre(f.quantityKgPerHa);
    const formattedName = formatFertilizerName(f.name);
    return `${qty} kg ${formattedName}`;
  });

  const { text, preposition } = formatTiming(timing);

  const timingPart = preposition
  ? `${preposition} ${text}`
  : text;
  return `Apply ${parts.join(", ")} per acre ${timingPart}`;
}

function generateSchedule({ crop, analysis, fertilizers }) {
  const scheduleData = cropSchedule[crop];

  if (!scheduleData) {
    throw new Error("No schedule found for selected crop");
  }

  const cropSplitConfig = nutrientSplits[crop] || {};
  const appliedFullDose = new Set();

  const finalSchedule = [];

  for (const stage of scheduleData) {
    const stageName = stage.stage;
    const stageNutrients = stage.nutrients || [];

    const matchedFertilizers = [];

    for (const nutrient of stageNutrients) {
      const level = analysis[nutrient];
      if (!level || level === "High") continue;

      const fert = fertilizers.find(
        (f) => f.nutrient === nutrient && f.quantityKgPerHa > 0
      );

      if (!fert) continue;

      const nutrientSplit = cropSplitConfig[nutrient];

      let finalQuantity;

      if (nutrientSplit) {
        const splitPercent = nutrientSplit[stageName];

        if (splitPercent !== undefined && splitPercent > 0) {
          finalQuantity = +(fert.quantityKgPerHa * splitPercent).toFixed(2);
        } else {
          continue;
        }
      } else {
        if (appliedFullDose.has(nutrient)) continue;

        finalQuantity = fert.quantityKgPerHa;
        appliedFullDose.add(nutrient);
      }

      matchedFertilizers.push({
        name: fert.name,
        nutrient: fert.nutrient,
        quantityKgPerHa: finalQuantity,
        unit: fert.unit,
        priority: fert.priority,
      });
    }

    if (matchedFertilizers.length === 0) continue;

    finalSchedule.push({
      stage: stage.stage,
      timing: stage.timing,
      type: stage.type,
      nutrients: stageNutrients,
      fertilizers: matchedFertilizers,
      advice: stage.advice || null,
      message: generateStageMessage(matchedFertilizers, stage.timing),
    });
  }

  return finalSchedule;
}

module.exports = { generateSchedule };