const fertilizerPrices = require("../data/fertilizerPrice.json");

function normalizeName(name) {
  if (!name || typeof name !== "string") return "";

  return name
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/:/g, "")
    .replace(/_/g, "")
    .replace(/%/g, "")
    .replace(/-/g, "");
}

const fertilizerAliases = {
  sodiumborate: "borax",
  boron: "borax",
  manganesesulphatemono: "manganesesulphate",
};

function findPriceData(fertilizerName) {
  let normalizedInput = normalizeName(fertilizerName);

  if (fertilizerAliases[normalizedInput]) {
    normalizedInput = fertilizerAliases[normalizedInput];
  }

  for (const key in fertilizerPrices) {
    const normalizedKey = normalizeName(key);

    if (normalizedKey === normalizedInput) {
      return fertilizerPrices[key];
    }
  }

  return null;
}

function calculateCost(recommendations, farmSizeAcre = 1) {
  const ACRE_TO_HECTARE = 1 / 2.471;

  const farmSizeHectare = farmSizeAcre * ACRE_TO_HECTARE;

  let totalCostPerHa = 0;
  let totalMinCostPerHa = 0;
  let totalMaxCostPerHa = 0;

  const breakdown = recommendations
    .filter((item) => item.quantityKgPerHa > 0)
    .map((item) => {
      const fertilizerName =
        item.fertilizer || item.name || item.fertilizerName;

      const quantity = item.quantityKgPerHa;

      const priceData = findPriceData(fertilizerName);

      if (!priceData) {
        return {
          ...item,
          cost: null,
          note: "Price data not available",
        };
      }

      const { pricePerBag, bagSizeKg } = priceData;

      const bagsRequired = Math.ceil(quantity / bagSizeKg);

      const cost = bagsRequired * pricePerBag;

      const minPrice = priceData.priceRange?.[0] || pricePerBag;
      const maxPrice = priceData.priceRange?.[1] || pricePerBag;

      const minCost = bagsRequired * minPrice;
      const maxCost = bagsRequired * maxPrice;

      totalCostPerHa += cost;
      totalMinCostPerHa += minCost;
      totalMaxCostPerHa += maxCost;

      return {
        ...item,

        // ✅ KEEP ORIGINAL TYPE (IMPORTANT FIX)
        type: item.type,

        // 💰 PRICE INFO (SEPARATE FIELD)
        pricing: {
          category: priceData.type, // subsidized / market
          bagSizeKg,
          pricePerBag,
          priceRange: priceData.priceRange,
          lastUpdated: priceData.lastUpdated,
        },

        bagsRequired,
        cost,
        minCost,
        maxCost,
      };
    });

  return {
    breakdown,

    perHectare: {
      totalCost: Math.round(totalCostPerHa),
      totalMinCost: Math.round(totalMinCostPerHa),
      totalMaxCost: Math.round(totalMaxCostPerHa),
    },

    farm: {
      farmSizeAcre,
      farmSizeHectare: Number(farmSizeHectare.toFixed(2)),
      totalCost: Math.round(totalCostPerHa * farmSizeHectare),
      totalMinCost: Math.round(totalMinCostPerHa * farmSizeHectare),
      totalMaxCost: Math.round(totalMaxCostPerHa * farmSizeHectare),
    },
  };
}

module.exports = { calculateCost };