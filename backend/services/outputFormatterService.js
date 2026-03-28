function formatOutput({ analysis, fertilizers, cost, soilData, soilSample }) {
  const analysisList = [];
  const summary = [];

  const low = [];
  const medium = [];
  const high = [];

  for (const nutrient in analysis) {
    const label = formatLabel(nutrient);
    const level = analysis[nutrient];

    if (label !== "EC") {
      analysisList.push({ nutrient: label, level });

      if (level === "Low") low.push(label);
      else if (level === "Medium") medium.push(label);
      else if (level === "High") high.push(label);
    }
  }

  if (low.length > 0) {
    summary.push(`Your soil is deficient in ${formatList(low)}.`);
  } else {
    summary.push("Your soil nutrient levels are sufficient.");
  }

  if (medium.length > 0) {
    summary.push(
      `${formatList(medium)} ${
        medium.length > 1 ? "are" : "is"
      } moderately available. Apply in reduced quantity.`
    );
  }

  if (high.length > 0) {
    summary.push(
      `No additional ${formatList(high).toLowerCase()} fertilizer is required.`
    );
  }

  if (soilData?.ec > 1) {
    summary.push(
      "Soil salinity is high. Ensure proper drainage and avoid excess fertilizer use."
    );
  }

  if (soilSample?.irrigationType === "Rainfed") {
    summary.push(
      "Apply fertilizers in split doses to prevent nutrient loss."
    );
  }

  const recommendations = [];

  fertilizers.forEach((f) => {
    if (f.quantityKgPerHa > 0) {
      const kgPerAcre = Math.round(f.quantityKgPerHa * 0.4047);

      recommendations.push({
        fertilizer: formatName(f.name),
        quantity: kgPerAcre,
        unit: "kg/acre",
        message: `Apply ${kgPerAcre} kg ${formatName(
          f.name
        )} per acre.`,
      });
    }
  });

  let costData = null;

  if (cost?.farm?.totalCost > 0) {
    costData = {
      total: cost.farm.totalCost,
      message: `Estimated total cost for your farm: ₹${cost.farm.totalCost}.`,
    };
  }

  return {
    analysis: analysisList,
    summary,
    recommendations,
    cost: costData,
  };
}

function formatLabel(str) {
  if (str.toLowerCase() === "ph") return "pH";
  if (str.toLowerCase() === "ec") return "EC";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatName(name) {
  return name.replace("_", " ").toUpperCase();
}

function formatList(arr) {
  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  return `${arr.slice(0, -1).join(", ")} and ${
    arr[arr.length - 1]
  }`;
}

module.exports = { formatOutput };