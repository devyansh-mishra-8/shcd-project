const express = require("express");

const router = express.Router();

router.get("/test", (req, res) => {
  res.send("Test route working");
});

// Express internal path matching can vary across versions; keep both forms.
router.get("test", (req, res) => {
  res.send("Test route working");
});

module.exports = router;