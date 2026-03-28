const express = require("express");
const cors = require("cors");

const testRoutes = require("./routes/testRoutes");
const soilScanRoutes = require("./routes/soilScanRoutes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/api", testRoutes);
app.use("/api", soilScanRoutes);

app.get("/", (req, res) => {
  res.send("API is running...");
});

module.exports = app;