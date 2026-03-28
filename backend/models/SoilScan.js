const mongoose = require("mongoose");

// 🔹 Fertilizer Schema
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

// 🔹 GPS Schema
const GPSSchema = new mongoose.Schema(
  {
    latitude: Number,
    longitude: Number,
  },
  { _id: false }
);

// 🔹 Soil Sample Schema
const SoilSampleSchema = new mongoose.Schema(
  {
    sampleNumber: String,
    collectionDate: String,
    surveyNumber: String,
    khasraNumber: String,
    farmSize: Number,
    irrigationType: String,
    gps: GPSSchema,
  },
  { _id: false }
);

// 🔹 Farmer Info Schema
const FarmerInfoSchema = new mongoose.Schema(
  {
    name: String,
    address: String,
    village: String,
    subDistrict: String,
    district: String,
    pin: String,
    mobile: String,
  },
  { _id: false }
);

// 🔹 Soil Data Schema
const SoilDataSchema = new mongoose.Schema(
  {
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
  { _id: false }
);

// 🔹 Main Soil Scan Schema
const SoilScanSchema = new mongoose.Schema(
  {
    farmerInfo: FarmerInfoSchema,

    soilSample: SoilSampleSchema,

    soilData: SoilDataSchema,

    analysis: {
      type: Map,
      of: String,
    },

    selectedCrop: {
      type: String,
      required: true,
    },

    recommendations: {
      fertilizers: [FertilizerSchema],
      schedule: [{ type: Object }],
    },

    cost: Object,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("SoilScan", SoilScanSchema);