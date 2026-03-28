const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const soilScanRoutes = require("./routes/soilScanRoutes");

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api", soilScanRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Global Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(process.env.PORT || 5000, () =>
      console.log("Server running")
    );
  })
  .catch((err) => console.log(err));