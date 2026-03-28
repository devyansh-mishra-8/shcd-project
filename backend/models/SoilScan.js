const mongoose = require("mongoose");

const FertilizerSchema = new mongoose.Schema(
  {
    name: String,
    nutrient: String,
    level: String,
    recommendation: String,
    percentage: Number,
    type: String,
    required: Number,
    available: Number,
    deficiency: Number,
    quantityKgPerHa: Number,
    note: String,
  },
  { _id: false }
);

const SoilScanSchema = new mongoose.Schema(
  {
    // 🔥 Farmer Info
    farmerInfo: {
      name: String,
      address: String,
      village: String,
      subDistrict: String,
      district: String,
      pin: String,
      mobile: String,
    },

    // 🔥 Soil Sample Details
    soilSample: {
      sampleNumber: String,
      collectionDate: String,
      surveyNumber: String,
      khasraNumber: String,
      farmSize: Number,
      irrigationType: String,
      gps: {
        latitude: Number,
        longitude: Number,
      },
    },

    // 🌱 Soil Data
    soilData: {
      ph: Number,
      ec: Number,
      organicCarbon: Number,
      nitrogen: Number,
      phosphorus: Number,
      potassium: Number,
      sulphur: Number,
      zinc: Number,
      boron: Number,
      iron: Number,
      manganese: Number,
      copper: Number,
    },

    analysis: {
      type: Map,
      of: String,
    },

    selectedCrop: String,

    // 🌾 Recommendations
    recommendations: {
      fertilizers: [FertilizerSchema],

      // ✅ FIX ONLY THIS LINE
      schedule: [{ type: Object }],
    },

    cost: Object,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { versionKey: false }
);

module.exports = mongoose.model("SoilScan", SoilScanSchema);